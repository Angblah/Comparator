from app import db, app as _app
from sqlalchemy import text, select
from flask import json
import sqlalchemy


# initializes db stored functions and adds some values
def initialize_db_structure():
    from cloudinary.api import delete_resources_by_prefix
    delete_resources_by_prefix('users/')
    db.session.rollback()
    db.session.close_all()
    db.drop_all()
    db.create_all()
    query = text("""
    CREATE EXTENSION IF NOT EXISTS tablefunc;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    create or replace function add_comparison_item (_comparison_id int, _position int, _name varchar, out _id int) returns int
      as $$
      begin

          update comparison_item set position = position + 1 where comparison_id = _comparison_id and position >= _position;
          insert into comparison_item (name, position, comparison_id) values (_name, _position, _comparison_id) returning id into _id;
          update sheet set date_modified = current_timestamp where id = _comparison_id;
      end;
    $$ language plpgsql;

    -- adds specified number of items to comparison table
    create or replace function add_comparison_item_back (_comparison_id int, _num_items int default 1) returns table(_id int)
        as $$
        -- NOTE: sequence is not used as item position may start from 0
        declare start_position int;
        begin
            select coalesce(max(position) + 1, 0) from comparison_item where comparison_id = _comparison_id into start_position;
            return query select * from add_comparison_items(_comparison_id, start_position, _num_items);

        end;
    $$ language plpgsql;

    -- adds empty items to specified location
    -- WARNING: adding items to positions not between (including ends) a comparison's existing items may lead to strange behavior
    create or replace function add_comparison_items (_comparison_id int, _position int, _num_items int default 1) returns table(_id int)
        as $$
        begin

            update comparison_item set position = position + _num_items where position >= _position and comparison_id = _comparison_id;
            update sheet set date_modified = current_timestamp where id = _comparison_id;

            return query insert into comparison_item(comparison_id, position) select _comparison_id, position from
                (select generate_series(_position, _position + _num_items - 1) as position) as positions returning id;

        end;
    $$ language plpgsql;


    create or replace function create_empty_comparison (_name varchar, _account_id int, _num_items int default 2, _num_attributes int default 2) returns int
        as $$
            declare _comparison_id int;
        begin
            insert into sheet(name, account_id) values (_name, _account_id) returning id into _comparison_id;
            insert into comparison(id) values (_comparison_id);
            perform add_comparison_item_back(_comparison_id, _num_items);
            perform add_sheet_attribute_back(_comparison_id, _num_attributes);
            return _comparison_id;
        end;
    $$ language plpgsql;

    create or replace function create_empty_template (_name varchar, _account_id int, _num_attributes int default 2) returns int
        as $$
            declare _template_id int;
        begin
            insert into sheet(name, account_id) values (_name, _account_id) returning id into _template_id;
            insert into user_template(id) values (_template_id);
            perform add_sheet_attribute_back(_template_id, _num_attributes);
            return _template_id;
        end;
    $$ language plpgsql;


    -- Swaps 2 items with associated comparison_item ids
    -- NOTE: assumes that both item are from the comparison table that the item with _id1 belongs to (for updating date_modified)
    create or replace function swap_comparison_item (_id1 int, _id2 int) returns void
        as $$
        begin
            with comparison_id as(
                    UPDATE comparison_item as t1
                    SET position = t2.position
                    FROM comparison_item as t2
                    WHERE t1.id IN(_id1,_id2)
                    AND t2.id IN(_id1,_id2)
                    AND t1.id != t2.id
                    RETURNING t1.comparison_id
                ) update sheet set date_modified = current_timestamp where id = (select id from comparison_id limit 1);
        end;
    $$ language plpgsql;


    -- moves specified id to specified position
    create or replace function move_comparison_item (_item_id int, _position int) returns void
        as $$
            declare _comparison_id int;
            declare _old_position int;
        begin

            update comparison_item t1
            set position = _position
            from comparison_item t2
            where t2.id = _item_id and t1.id = t2.id
            returning t2.comparison_id, t2.position
            into _comparison_id, _old_position;

            -- move forwards
            if _position > _old_position then
                update comparison_item set position = position - 1 where comparison_id = _comparison_id and position between _old_position and _position and id != _item_id;
            -- move backwards
            elsif _position < _old_position then
                update comparison_item set position = position + 1 where comparison_id = _comparison_id and position between _position and _old_position and id != _item_id;
            end if;
            update sheet set date_modified = current_timestamp where id = _comparison_id;

        end;
    $$ language plpgsql;

    create or replace function swap_attribute (_id1 int, _id2 int) returns void
        as $$
        begin
            with sheet_id as(
                    UPDATE sheet_attribute as t1
                    SET position = t2.position
                    FROM sheet_attribute as t2
                    WHERE t1.id IN(_id1,_id2)
                    AND t2.id IN(_id1,_id2)
                    AND t1.id != t2.id
                    RETURNING t1.sheet_id
                ) update sheet set date_modified = current_timestamp where id = (select id from sheet_id limit 1);
        end;
    $$ language plpgsql;

    -- moves specified id to specified position
    create or replace function move_attribute (_attribute_id int, _position int) returns void
        as $$
            declare _sheet_id int;
            declare _old_position int;
        begin
            update sheet_attribute t1
            set position = _position
            from sheet_attribute t2
            where t2.id = _attribute_id and t1.id = t2.id
            returning t2.sheet_id, t2.position
            into _sheet_id, _old_position;

            -- move forwards
            if _position > _old_position then
                update sheet_attribute set position = position - 1 where sheet_id = _sheet_id and position between _old_position and _position and id != _attribute_id;
            -- move backwards
            elsif _position < _old_position then
                update sheet_attribute set position = position + 1 where sheet_id = _sheet_id and position between _position and _old_position and id != _attribute_id;
            end if;
            update sheet set date_modified = current_timestamp where id = _sheet_id;

        end;
    $$ language plpgsql;

    create or replace function delete_comparison_item (_comparison_id int, _position int) returns void
        as $$
        begin
            update sheet set date_modified = current_timestamp where id = _comparison_id;
            delete from comparison_item where comparison_id = _comparison_id and position = _position;
            update comparison_item set position = position - 1 where comparison_id = _comparison_id and position > _position;
        end;
    $$ language plpgsql;

    create or replace function delete_comparison_item(_item_id int) returns void
        as $$
        begin
            with delete_1 as (
                delete from comparison_item where id = _item_id returning position, comparison_id
                ), update_1 as (
                  update sheet set date_modified = current_timestamp where id = (select comparison_id from delete_1)
                ) update comparison_item set position = position - 1 where comparison_id = (select comparison_id from delete_1) and position > (select position from delete_1);
        end;
    $$ language plpgsql;

    create or replace function delete_sheet_attribute (_id int) returns void
        as $$
        begin
            with delete_1 as (
                delete from sheet_attribute where id = _id returning position, sheet_id
            ), update_1 as (
                update sheet set date_modified = current_timestamp where id = (select sheet_id from delete_1)
            ) update sheet_attribute set position = position - 1 where sheet_id = (select sheet_id from delete_1) and position > (select position from delete_1);
        end;
    $$ language plpgsql;

    create or replace function comparison_table_stacked (_comparison_id int) returns table(type_id smallint, "id" int, "position" int, attribute_name varchar, val varchar, item_name varchar, item_id int, worth int)
        as $$
        begin
            return query select sheet_attribute.type_id, sheet_attribute.id, comparison_item.position, sheet_attribute.name, coalesce(attribute_value.val, ''), comparison_item.name, comparison_item.id, coalesce(attribute_value.worth, 1)
            from comparison
                inner join sheet_attribute on comparison.id = sheet_attribute.sheet_id
                inner join comparison_item on comparison.id = comparison_item.comparison_id
                left join attribute_value on comparison_item.id = attribute_value.item_id and sheet_attribute.id = attribute_value.attribute_id
                where comparison.id = _comparison_id
                order by comparison_item.position, sheet_attribute.position;
        end;
    $$ language plpgsql;


    create or replace function add_sheet_attribute (_sheet_id int, attribute_name varchar(255), attribute_type_id smallint, _weight int default 1, out attribute_id int) returns int
        as $$
        begin
            insert into sheet_attribute (name, type_id, sheet_id, weight, position) select attribute_name, attribute_type_id, _sheet_id, _weight, coalesce(max(position), -1) + 1 from sheet_attribute where sheet_id = _sheet_id returning id into attribute_id;
            update sheet set date_modified = current_timestamp where id = _sheet_id;
        end;
    $$ language plpgsql;

    create or replace function add_sheet_attribute_back (_sheet_id int, _num_attributes int default 1) returns table(_id int)
        as $$
            declare start_position int;
        begin
            select coalesce(max(position) + 1, 0) from sheet_attribute where sheet_id = _sheet_id into start_position;
            return query select * from add_sheet_attributes(_sheet_id, start_position, _num_attributes);
        end;
    $$ language plpgsql;

    create or replace function add_sheet_attributes (_sheet_id int, _position int, _num_attributes int default 1) returns table(_id int)
        as $$
        begin
            update sheet_attribute set position = position + _num_attributes where position >= _position and sheet_id = _sheet_id;
            update sheet set date_modified = current_timestamp where id = _sheet_id;
            return query insert into sheet_attribute(sheet_id, position) select _sheet_id, position from
                (select generate_series(_position, _position + _num_attributes - 1) as position) as positions returning id;

        end;
    $$ language plpgsql;


    create or replace function set_comparison_attribute_value (comparison_item_id int, item_attribute_id int, new_value varchar(255)) returns void
        as $$
        begin
            insert into attribute_value (item_id, attribute_id, val) values (comparison_item_id, item_attribute_id, new_value)
                on conflict (item_id, attribute_id) do update
                    set val = new_value;
            update sheet set date_modified = current_timestamp where id = (select comparison_id from comparison_item where comparison_item.id = comparison_item_id);

        end;
    $$ language plpgsql;

    create or replace function register_user(_email varchar, _username varchar, _password varchar, out _account_id int) returns int as
    $$
        begin
            insert into account (email, username, passhash) values (_email, _username, crypt(_password, gen_salt('bf', 8))) returning id into _account_id;
        end;
    $$ language plpgsql;

    create or replace function set_password(_user_id int, _password varchar) returns void as
    $$
        begin
            update account set passhash = crypt(_password, gen_salt('bf', 8)) where id = _user_id;
        end;
    $$ language plpgsql;

    create or replace function validate_login(_username varchar, _password varchar) returns boolean as
    $$
        declare _passhash varchar;
        begin
            select passhash from account where username = _username into _passhash;
            if found then
                return _passhash = crypt(_password, _passhash);
            else
                return found;
            end if;

        end;
    $$ language plpgsql;


    create or replace function save_comparison_as_template (_comparison_id int, _template_name varchar) returns int
        as $$
            declare _template_id int;
        begin
            insert into sheet (name, account_id) select _template_name, account_id from sheet where id = _comparison_id returning id into _template_id;
            insert into user_template(id) values (_template_id);
            insert into sheet_attribute (name, type_id, sheet_id, weight, position) select name, type_id, _template_id, weight, position from sheet_attribute where sheet_id = _comparison_id;
            return _template_id;
        end;
    $$ language plpgsql;

    create or replace function create_comparison_from_template (_account_id int, _template_id int, _comparison_name varchar default null, _num_items int default 2) returns int
        as $$
            declare _comparison_id int;
        begin
            -- name of new comparison is template name if not set
            insert into sheet (name, account_id) select coalesce(_comparison_name, (select name from sheet where id = _template_id)), _account_id returning id into _comparison_id;
            insert into comparison(id) values (_comparison_id);
            insert into sheet_attribute (name, type_id, sheet_id, weight, position) select name, type_id, _comparison_id, weight, position from sheet_attribute where sheet_id = _template_id;
            perform add_comparison_item_back(_comparison_id, _num_items);
            return _comparison_id;
        end;
    $$ language plpgsql;

    -- TODO: consider using generate_series to speed up
    -- NOTE: all arrays must be of same length, though this will NOT be checked by stored function
    -- NOTE: 1st index of array is "1", NOT "0"
    create or replace function make_template (_account_id int, _template_name varchar, _type_ids smallint[], _type_names varchar[], _weights int[]) returns int
        as $$
            declare _template_id int;
        begin
            insert into sheet (name, account_id) values (_template_name, _account_id) returning id into _template_id;
            insert into user_template(id) values (_template_id);
            for i in 1..cardinality(_type_ids) loop
                insert into sheet_attribute (name, type_id, sheet_id, weight, position) values (_type_names[i], _type_ids[i], _template_id, _weights[i], i - 1);
            end loop;
            return _template_id;
        end;
    $$ language plpgsql;

    -- NOTE: all arrays must be of same length, though this will NOT be checked by stored function
    -- NOTE: 1st index of array is "1", NOT "0"
    create or replace function make_template (_account_id int, _template_name varchar, _type_ids smallint[], _type_names varchar[]) returns int
        as $$
            declare _template_id int;
        begin
            insert into sheet (name, account_id) values (_template_name, _account_id) returning id into _template_id;
            insert into user_template(id) values (_template_id);
            for i in 1..cardinality(_type_ids) loop
                insert into sheet_attribute (name, type_id, sheet_id, position) values (_type_names[i], _type_ids[i], _template_id, i - 1);
            end loop;
            return _template_id;
        end;
    $$ language plpgsql;

    create or replace function get_template (_template_id int) returns table(id int, name varchar, weight int, "position" int, type_id smallint)
        as $$
        begin
            return query
                select sheet_attribute.id, sheet_attribute.name, sheet_attribute.weight, sheet_attribute.position, sheet_attribute.type_id from user_template
                    inner join sheet_attribute
                    on user_template.id = sheet_attribute.sheet_id
                    where user_template.id = _template_id
                    order by sheet_attribute.position;
        end;
    $$ language plpgsql;

    create or replace function copy_comparison (_comparison_id int, _account_id int) returns int
        as $$
            declare new_comparison_id int;
        begin
            insert into sheet (name, comment, account_id) select name || ' (copy)', comment, account_id from sheet where id = _comparison_id returning id into new_comparison_id;
            insert into comparison(id) values (new_comparison_id);
            with attribute_ids as (
            select id as attribute_id, name, type_id, weight, position, row_number() over () from sheet_attribute where sheet_id = _comparison_id
            ),
            item_ids as (
                select id as item_id, position, row_number() over () from comparison_item where comparison_id = _comparison_id
            ),
            ins1 as (
                insert into sheet_attribute (name, type_id, sheet_id, weight, position) select name, type_id, new_comparison_id, weight, position from attribute_ids returning id as attribute_ins_id
            ),
            ins2 as (
                insert into comparison_item (position, comparison_id) select position, new_comparison_id from item_ids returning id as item_ins_id
            ),
            attribute_ins as (
                select * from (select row_number() over (), * from ins1) as ins1 inner join attribute_ids on ins1.row_number = attribute_ids.row_number
            ),
            item_ins as (
                select * from (select row_number() over (), * from ins2) as ins2 inner join item_ids on ins2.row_number = item_ids.row_number
            ) insert into attribute_value (item_id, attribute_id, val) select item_ins_id, attribute_ins_id, val from attribute_value
                inner join attribute_ins on attribute_value.attribute_id = attribute_ins.attribute_id
                inner join item_ins on attribute_value.item_id = item_ins.item_id;

            return new_comparison_id;
        end;
    $$ language plpgsql;

    -- _template_id = id of template to copy from
    -- _account_id = id of account to copy to
    create or replace function copy_template (_template_id int, _account_id int) returns int
        as $$
            declare _new_template_id int;
        begin
            insert into sheet (name, comment, account_id) select name || ' (copy)', comment, _account_id from sheet where id = _template_id returning id into _new_template_id;
            insert into user_template(id) values (_new_template_id);
            insert into sheet_attribute (name, type_id, sheet_id, weight, position) select name, type_id, _new_template_id, weight, position from sheet_attribute where sheet_id = _template_id;
            return _new_template_id;
        end;
    $$ language plpgsql;

    -- Sorts specified comparison by specified attribute (ascending)
    -- NOTE: dynamic sql used as you cannot use order by case with casting to different types as column types cannot differ
    -- TODO: try to make more efficient (maybe use sequence instead of row number, combine with dynamic sql portion?)
    -- TODO: consider separating sort update into helper function to take in any list of attribute ids
    -- TODO: look into whether joins would be more efficient (check explain statements)
    create or replace function sort_by_attribute(_attribute_id int) returns void as
    $$
    declare _comparison_id int;
    declare _type_id smallint;
    declare _type varchar;
    begin
        select sheet_id, type_id from sheet_attribute where id = _attribute_id into _comparison_id, _type_id;

        select sort_type from data_type where id = _type_id into _type;

        execute format('create or replace temp view sort_view as select comparison_item.id as _item_id from sheet_attribute
            inner join comparison_item on sheet_attribute.sheet_id = comparison_item.comparison_id
            left join attribute_value on attribute_value.item_id = comparison_item.id and attribute_value.attribute_id = sheet_attribute.id
            where sheet_attribute.sheet_id = %s and sheet_attribute.id = %s
            order by val::%s', _comparison_id, _attribute_id, _type);

        update comparison_item set position = row_number - 1
        from (select row_number() over (), * from sort_view) as t
        where comparison_id = _comparison_id and comparison_item.id = _item_id;

        update sheet set date_modified = current_timestamp where id = _comparison_id;

    end;
    $$ language plpgsql;

    -- updates comparison item ordering by ordered array of comparison_item id's
    create or replace function sort_by_item_ordering(_ordering int[]) returns void as
    $$
    begin
        with new_order as (
        select row_number() over (), "unnest" as "id" from unnest(_ordering)
        ) update comparison_item as c
            set position = row_number - 1
            from new_order as n
            where c.id = n.id;
    end;
    $$ language plpgsql;

    -- updates sheet attribute ordering by ordered array of sheet_attribute id's
    create or replace function sort_sheet_by_attribute_ordering(_ordering int[]) returns void as
    $$
    begin
        with new_order as (
        select row_number() over (), "unnest" as "id" from unnest(_ordering)
        ) update sheet_attribute as c
            set position = row_number - 1
            from new_order as n
            where c.id = n.id;
    end;
    $$ language plpgsql;

    /*
    Function adapted from Erwin Brandstetter's response on http://stackoverflow.com/questions/36804551/execute-a-dynamic-crosstab-query
    Creates view comparison_table_horizontal containing pivot table result
    */
    CREATE OR REPLACE FUNCTION comparison_table_horizontal_query(table_comparison_id int) RETURNS text AS
        $func$
        DECLARE
           _cat_list text;
           _col_list text;
        BEGIN

        -- generate categories for xtab param and col definition list
        EXECUTE format(
         $$SELECT string_agg(quote_literal(x.cat), '), (')
                , string_agg(quote_ident  (x.cat), %L)
           FROM  (SELECT "name" as cat FROM comparison_item where comparison_id = %s ORDER BY "position") x$$
         , ' ' || 'varchar(255)' || ', ', table_comparison_id)
        INTO  _cat_list, _col_list;

        -- generate query string
        RETURN format(
          'SELECT * FROM crosstab(
           $q$
               SELECT attribute_name, item_name, val
               FROM   (select * from comparison_table_stacked(%3$s)) as t1
               order by id
               $q$
         , $c$VALUES (%1$s)$c$
           ) ct(name text, %2$s varchar(255))'
        , _cat_list, _col_list, table_comparison_id
        );
        END
        $func$ LANGUAGE plpgsql;

    -- populates database with initial values (values needed for data types, as well as default templates/comparisons)
    create or replace function populate_database() returns void as
    $$
        begin
            insert into data_type (id, sort_type, type_name) values (0, 'varchar', 'varchar'), (1, 'decimal', 'decimal'), (2, 'timestamptz', 'timestamptz'), (3, 'varchar', 'image'), (4, 'interval', 'duration');
        end;
    $$ language plpgsql;

    create or replace function populate_database_test_values() returns void
        as $$
        declare _account_id int;
        declare test_account int;


        declare washer_template int;
        declare laptop_template int;
        declare camera_template int;
        declare cars_template int;
        declare phone_template int;
        declare sink_template int;
        declare fridge_template int;

        declare washer_comparison int;
        declare laptop_comparison int;

        begin

            select register_user('a@a.com', 'admin', 'password') into _account_id;
            perform register_user('b@b.com', 'guest', 'guest_password');
            select register_user('test@comparator_test.com', 'Honey', 'Honey') into test_account;

            perform create_empty_template('Empty Template', _account_id);
            select make_template(1, 'Top Load Washers', Array[1, 1, 0, 4, 1, 1, 0]::smallint[],
                                  Array['price', 'capacity', 'color', 'wash time', 'water efficiency', 'energy efficiency', 'type']) into washer_template;
            select make_template(1, 'Laptops', Array[1, 0, 1, 1, 1, 1, 0, 4]::smallint[],
                                  Array['Price', 'Operating System', 'Memory', 'Hard Drive', 'Graphics Card', 'Weight', 'Size', 'Battery Life']) into laptop_template;
            select make_template(1, 'Cameras', Array[1, 1, 1, 4, 4, 1, 0, 1, 4]::smallint[],
                                  Array['Price', 'Megapixels', 'Image Quality','Shutter Lag', 'Startup Time', 'Weight', 'Size', 'Storage Space', 'Battery Life']) into camera_template;
            select make_template(1, 'Cars', Array[1, 1, 0, 0, 1]::smallint[],
                                  Array['MSRP', 'MPG', 'Engine', 'Transmission', 'Drivetrain', 'Seats']) into cars_template;
            select make_template(1, 'Phone', Array[1, 1, 0, 1, 0, 0, 0, 0, 0]::smallint[],
                                  Array['Price', 'Speed', 'Dimensions', 'Weight', 'CPU', 'GPU', 'GPS', 'Camera', 'OS']) into phone_template;
            select make_template(1, 'Sink', Array[1, 0, 0, 0, 0, 0, 0, 0]::smallint[],
                                  Array['Price', 'Type', 'Material', 'Durability', 'Ease of Cleaning', 'Depth', 'Stain Resistance', 'Heat Resistance']) into sink_template;
            select make_template(1, 'Fridge', Array[1, 0, 0, 0, 0, 1, 1, 0, 1]::smallint[],
                                  Array['MSRP', 'Type', 'Installation', 'Color', 'Ice/Water Dispenser', 'Width', 'Height', 'Energy Certifications', 'Capacity']) into fridge_template;

            select create_comparison_from_template(test_account, washer_template, 'Top Load Washers', 3) into washer_comparison;
            update comparison_item set name = 'washer 1' where position = 0 and comparison_id = washer_comparison;
            update comparison_item set name = 'washer 2' where position = 1 and comparison_id = washer_comparison;
            update comparison_item set name = 'washer 3' where position = 2 and comparison_id = washer_comparison;

            perform create_comparison_from_template(test_account, laptop_template, 'Laptops', 3);
            perform create_comparison_from_template(test_account, camera_template, 'Cameras', 3);
            perform create_comparison_from_template(test_account, cars_template, 'Cars', 3);
            perform create_comparison_from_template(test_account, phone_template, 'Phones', 3);
            perform create_comparison_from_template(test_account, sink_template, 'Sink', 3);
            perform create_comparison_from_template(test_account, fridge_template, 'Refrigerator', 3);

            perform create_empty_comparison('Empty comparison', _account_id);


            -- TODO: create and move default templates/comparisons to populate_database()
        end;
    $$ language plpgsql;

    create or replace function initialize_db_values() returns void as
    $$
        begin
            perform populate_database();
            perform populate_database_test_values();
        end;
    $$ language plpgsql;

    """)
    db.engine.execute(query.execution_options(autocommit=True))


# TODO: change default comparisons + templates for admin to be actual defaults instead of balls

############################################################################################
# Account related functions

# returns 1 for valid registration parameters, 2 for invalid email, 3 for invalid username
def validate_registration(email, username):
    from models import Account

    if db.engine.execute((select([Account.id]).where(Account.email == email))).rowcount > 0:
        # DUPLICATE EMAIL
        return 2
    elif db.engine.execute((select([Account.id]).where(Account.username == username))).rowcount > 0:
        # DUPLICATE USERNAME
        return 3
    return 1


def register_user(email, username, password):
    query = text("""select register_user(:email, :username, :password)""")
    db.engine.execute(query.execution_options(autocommit=True), email=email, username=username, password=password).close()


def set_password(user_id, password):
    query = text("""select set_password(:user_id, :password)""")
    db.engine.execute(query.execution_options(autocommit=True), user_id=user_id, password=password).close()


# returns true if login credentials valid, false otherwise
def validate_login(username, password):
    query = text("""select validate_login(:username, :password)""")
    return db.engine.execute(query, username=username, password=password).scalar()


def delete_account(id):
    from cloudinary.api import delete_resources_by_prefix

    query = text("""
    delete from account where id = :id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), id=id)

    # delete all images related to user
    delete_resources_by_prefix('users/' + str(id))


############################################################################################

############################################################################################
# Sheet related functions

def set_sheet_comment(sheet_id, comment):
    query = text("""
    update sheet set comment = :comment, date_modified = current_timestamp where id = :sheet_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, comment=comment)


def set_sheet_name(sheet_id, name):
    query = text("""
    update sheet set name = :name, date_modified = current_timestamp where id = :sheet_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, name=name)


def delete_sheet(sheet_id):
    query = text("""
    delete from sheet where id = :sheet_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id)


############################################################################################

############################################################################################
# Attribute related functions

def delete_sheet_attribute(attribute_id):
    query = text("""
    select delete_sheet_attribute(:attribute_id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), attribute_id=attribute_id).close()


def add_sheet_attribute(sheet_id, attribute_name, type_id, weight=1):
    query = text("""
    select add_sheet_attribute(:sheet_id, :attribute_name, :type_id, :weight);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, attribute_name=attribute_name,
                             type_id=type_id, weight=weight).scalar()


def add_sheet_attribute_back(sheet_id, num_attributes=1, get_json=True):
    query = text("""
    select add_sheet_attribute_back (:sheet_id, :num_attributes)
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id,
                               num_attributes=num_attributes)

    if num_attributes == 1:
        return result.scalar()

    if get_json:
        return jsonify_column(result)
    return result


def add_sheet_attributes(sheet_id, position, num_attributes, get_json=True):
    query = text("""
    select add_sheet_attributes (:sheet_id, :position, :num_attributes)
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, position=position,
                               num_attributes=num_attributes)
    if get_json:
        return jsonify_column(result)
    return result


def swap_attribute(id1, id2):
    query = text("""
    select swap_attribute(:id1, :id2);
    """)
    db.engine.execute(query.execution_options(autocommit=True), id1=id1, id2=id2).close()


def move_attribute(attribute_id, position):
    query = text("""
    select move_attribute(:attribute_id, :position);
    """)
    db.engine.execute(query.execution_options(autocommit=True), attribute_id=attribute_id, position=position).close()


def set_comparison_attribute_value(item_id, attribute_id, new_value):
    query = text("""
    select set_comparison_attribute_value(:item_id, :attribute_id, :new_value);
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, attribute_id=attribute_id,
                      new_value=new_value).close()

# TODO: update date modified of associated table
# WARNING: will fail if attribute value does not have a value assigned
def set_attribute_value_worth(item_id, attribute_id, worth):
    query = text("""
    update attribute_value set worth = :worth where item_id = :item_id and attribute_id = :attribute_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, attribute_id=attribute_id, worth=worth)


# sorts comparison by specified attribute (ascending)
def sort_by_attribute(attribute_id):
    query = text("""
    select sort_by_attribute(:attribute_id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), attribute_id=attribute_id).close()


# sorts sheet (comparison or template) attributes by ordering (list of attribute id's)
def sort_by_attribute_ordering(ordering):
    query = text("""
    select sort_by_attribute_ordering(:ordering);
    """)
    db.engine.execute(query.execution_options(autocommit=True), ordering=ordering).close()


# valid fields are name, type_id, weight (id and comparison_id should probably not be changed)
def set_sheet_attribute_field(attribute_id, field, field_value):
    # format used rather than only sqlalchemy's parameters to allow safe dynamic column selection
    query = text("""
    do $$
    begin
    execute format('update sheet_attribute set %I = %L where id = :attribute_id', :field, :field_value);
    end
    $$;
    """)
    db.engine.execute(query.execution_options(autocommit=True), field=field, field_value=field_value,
                      attribute_id=attribute_id)


############################################################################################

############################################################################################
# Comparison related functions

# returns array of all comparison ids of specified user
def get_user_comparison_ids(user_id, get_json=True):
    from models import Comparison
    result = db.engine.execute((select([Comparison]).where(Comparison.account_id == user_id)))
    output = [row['id'] for row in result]

    if get_json:
        return json.dumps(output)
    return output


def get_recent_user_comparisons(user_id, number=None, get_json=True):
    query = """
    select * from Comparison inner join Sheet using(id) where Sheet.account_id = :user_id order by date_modified desc
    """
    if number is not None:
        query += """limit :number"""

    query = text(query)
    result = db.engine.execute(query, user_id=user_id, number=number)
    if get_json:
        return jsonify_table(result)
    return result


# returns values of comparison table for specified user
def get_user_comparisons(user_id, get_json=True):
    query = text("""
        select * from Comparison inner join Sheet using(id) where Sheet.account_id = :user_id;
        """)
    result = db.engine.execute(query, user_id=user_id)
    if get_json:
        return jsonify_table(result)
    return result


# get comparison related data (includes attribute values)
def get_comparison(comparison_id, get_json=True):
    query = text("""
    select * from comparison_table_stacked(:comparison_id);
    """)

    result = db.engine.execute(query, comparison_id=comparison_id)
    if get_json:
        curr_position = -1

        query = text("""
        select * from comparison inner join sheet using(id) where comparison.id = :comparison_id;
        """)

        # info put as separate part of json to allow easier React use (as fields other than 'id' used rarely)
        data = {}
        row = db.engine.execute(query, comparison_id=comparison_id).fetchone()
        data['id'] = row['id']
        temp = {}
        for key, value in row.items():
            if key != 'id':
                temp[key] = value
        data['info'] = temp

        attributes = []
        items = []
        item = None
        attributes_parsed = False
        for row in result:

            # start of new item
            if row[2] != curr_position:
                curr_position = row[2]
                # not start of first item (previous item can be appended to list of items)
                if item is not None:
                    items.append(item)
                    attributes_parsed = True
                item = {}

            # attribute id mapped to dict mapping "val" and "worth" for specific item
            item[str(row[1])] = {"val": row[4], "worth": row[7]}
            item['name'] = row[5]
            item['id'] = row[6]

            if not attributes_parsed:
                attribute = {}
                attribute['type_id'] = row[0]
                attribute['id'] = row[1]
                attribute['name'] = row[3]
                attributes.append(attribute)

        if item is not None:
            items.append(item)

        data['attributes'] = attributes
        data['items'] = items

        return json.dumps(data)
    return result


def delete_comparison_item(item_id):
    query = text("""
    select delete_comparison_item(:item_id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id).close()


# saves specified comparison as template with given name, returns new template id
def save_comparison_as_template(comparison_id, template_name):
    query = text("""
    select save_comparison_as_template(:comparison_id, :template_name);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id,
                             template_name=template_name).scalar()


def add_comparison_item(comparison_id, position, name=None):
    query = text("""
    select add_comparison_item(:comparison_id, :position, :name);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, position=position,
                             name=name).scalar()


def add_comparison_item_back(comparison_id, num_items=1, get_json=True):
    query = text("""
    select add_comparison_item_back(:comparison_id, :num_items);
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id,
                               num_items=num_items)
    if num_items == 1:
        return result.scalar()

    if get_json:
        return jsonify_column(result)
    return result


def add_comparison_items(comparison_id, position, num_items=1, get_json=True):
    query = text("""
    select add_comparison_items (:comparison_id, :num_items, :position)
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, position=position,
                               num_items=num_items)
    if get_json:
        return jsonify_column(result)
    return result


def swap_comparison_item(id1, id2):
    query = text("""
    select swap_comparison_item (:id1, :id2);
    """)
    db.engine.execute(query.execution_options(autocommit=True), id1=id1, id2=id2).close()


def move_comparison_item(item_id, position):
    query = text("""
    select move_comparison_item(:item_id, :position);
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, position=position).close()


def delete_comparison_item_by_position(comparison_id, position):
    query = text("""
    select delete_comparison_item(:comparison_id, :position);
    """)
    db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, position=position).close()


# sorts comparison items by ordering determined by inputted list of ordered comparison_item id's
def sort_by_item_ordering(ordering):
    query = text("""
    select sort_by_item_ordering(:ordering);
    """)
    db.engine.execute(query.execution_options(autocommit=True), ordering=ordering).close()


def set_item_name(item_id, name):
    query = text("""
    update comparison_item set name = :name where id = :item_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, name=name)


# create comparison from template and assigns it to the account specified
# account_id = account to assign template to
# template_id = template to create comparison from
# comparison_name = name of new comparison (defaults to template name if left as None)
# num_items = number of items to initialize comparison with
def create_comparison_from_template(account_id, template_id, comparison_name=None, num_items=2):
    query = text("""
    select create_comparison_from_template(:account_id, :template_id, :comparison_name, :num_items);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), account_id=account_id, template_id=template_id,
                             comparison_name=comparison_name, num_items=num_items).scalar()


# copies comparison into specified account, returns comparison id
def copy_comparison(comparison_id, account_id):
    query = text("""
    select * from copy_comparison(:comparison_id, :account_id);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id,
                             account_id=account_id).scalar()


def create_empty_comparison(account_id, name='New Comparison', num_items=2, num_attributes=2):
    query = text("""
    select * from create_empty_comparison(:name, :account_id, :num_items, :num_attributes)
    """)
    return db.engine.execute(query.execution_options(autocommit=True), account_id=account_id, name=name,
                             num_items=num_items, num_attributes=num_attributes).scalar()


# returns csv of specified comparison (image values are keys for corresponding cloudinary images)
def export_comparison(comparison_id, file_type='csv'):
    import flask_excel as excel
    from sqlalchemy import text

    filename = db.engine.execute(text('select name from sheet where id = :comparison_id'),
                                 comparison_id=comparison_id).scalar()

    query = text("""
        select comparison_item.position, sheet_attribute.name as "attribute_name", coalesce(attribute_value.val, '') as "val", comparison_item.name as "item_name"
                from comparison
                    inner join sheet_attribute on comparison.id = sheet_attribute.sheet_id
                    inner join comparison_item on comparison.id = comparison_item.comparison_id
                    left join attribute_value on comparison_item.id = attribute_value.item_id and sheet_attribute.id = attribute_value.attribute_id
                    where comparison.id = :comparison_id
                    order by comparison_item.position, sheet_attribute.position;
        """)

    comparison = db.engine.execute(query, comparison_id=comparison_id)

    row = 0
    output = [['']]
    col = -1
    for row_proxy in comparison:
        if row_proxy['position'] != col:
            # new item started processing
            col = row_proxy['position']
            row = 0
            # TODO: find out why empty trailing strings are removed in make_response_from_array, remove workaround
            # NOTE: current workaround uses single space instead of empty string
            # output[0].append(row_proxy['item_name'])
            name = row_proxy['item_name']
            if name == '':
                name = ' '
            output[0].append(name)

        if col == 0:
            # add attribute rows only while processing first item (as already added for next items)
            output.append([row_proxy['attribute_name']])
        # first row reserved for item names
        output[row + 1].append(row_proxy['val'])
        row += 1

    return excel.make_response_from_array(output, file_type=file_type, file_name=filename)


############################################################################################

############################################################################################
# Template related functions

def get_sample_templates():
    return get_user_templates_detailed(1)


def get_user_templates_detailed(id):
    query = text("""
        select sheet.id, sheet.name, sheet_attribute.name as attribute_name from user_template
        natural join sheet
        inner join sheet_attribute on sheet_id = sheet.id
        where account_id = (select id from account where id = :id)
        order by sheet.id;
        """)
    result = db.engine.execute(query, id=id)
    id = -1
    name = None
    data = {}
    for row in result:
        if row['id'] != id:
            id = row['id']
            name = row['name']
            data[(id, name)] = []
        # null attribute names not added
        if row['attribute_name']:
            data[(id, name)].append(row['attribute_name'])
    return data


# returns array of template ids for specified user
def get_user_template_ids(user_id, get_json=True):
    result = get_user_templates(user_id)
    output = [row['id'] for row in result]

    if get_json:
        return json.dumps(output)
    return output


def get_user_templates(user_id, get_json=True):
    query = text("""
            select * from User_Template inner join Sheet using(id) where Sheet.account_id = :user_id;
            """)
    result = db.engine.execute(query, user_id=user_id)
    if get_json:
        return jsonify_table(result)
    return result


def get_recent_user_templates(user_id, number=None, get_json=True):
    query = """
        select * from User_Template inner join Sheet using(id) where Sheet.account_id = :user_id order by date_modified desc
        """
    if number is not None:
        query += "limit :number"

    query = text(query)

    result = db.engine.execute(query, user_id=user_id, number=number)
    if get_json:
        return jsonify_table(result)
    return result


def get_template(id, get_json=True):
    query = text("""
    select * from get_template(:id);
    """)
    result = db.engine.execute(query, id=id)
    if get_json:
        data = jsonify_table(result, get_json=True)
    else:
        data = jsonify_table(result, get_json=False)

    return data


# copies template into specified account, returns new template id
def copy_template(template_id, account_id):
    query = text("""
    select * from copy_template(:template_id, :account_id);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), template_id=template_id,
                             account_id=account_id).scalar()


def create_empty_template(account_id, name='New Template', num_attributes=2):
    query = text("""
    select * from create_empty_template(:name, :account_id, :num_attributes)
    """)
    return db.engine.execute(query.execution_options(autocommit=True), account_id=account_id, name=name,
                             num_attributes=num_attributes).scalar()


############################################################################################

############################################################################################
# Misc database related functions

def initialize_db_values():
    query = text("""
        select initialize_db_values()
    """)
    db.engine.execute(query.execution_options(autocommit=True)).close()


# takes in ResultProxy from executed query, returns json array of rows mapping column names to values
def jsonify_table(result, get_json=True):
    data = []

    for row in result:
        temp = {}
        for key, value in row.items():
            temp[key] = value
        data.append(temp)
    if get_json:
        return json.dumps(data)
    return data


# returns simple json array for single column result
def jsonify_column(result):
    data = []
    for row in result:
        data.append(row[0])
    return json.dumps(data)


############################################################################################

if __name__ == '__main__':
    initialize_db_structure()
    initialize_db_values()

    # TODO: consider renaming ...sheet_attribute... functions to just ...attribute...
    # TODO: after implementation actally used in real life, change admin/guest login info and set outside of pushed code
    # TODO: let users "claim" comparisons they can view (copy all data into their comparisons)
    # TODO: consider changing date_modified to update from database trigger (many functions now forget to update date_modified)
    # downsides: may be inefficient for multirow deletes/update relating to the same Sheet
    # TODO: see if need to check in app.py if current_user matches that of edited information to prevent code injection
    # TODO: retrieve non-pivot table and pivot in server so that null/duplicate (like empty string) item columns doesn't error csv download
    # TODO: check that sqlalchemy connection pool is limited to 20 connections (free heroku db limit)
    # TODO: make guest/admin ids constants instead of hard coded



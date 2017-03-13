from app import db
from sqlalchemy import text, select
from flask import json
import sqlalchemy
# TODO: look into sessions and rollback
# initializes db stored functions and adds some values
def initialize_db_structure():

    db.drop_all()
    db.create_all()
    query = text("""
    --CREATE EXTENSION IF NOT EXISTS tablefunc;
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

    create or replace function comparison_table_stacked (_comparison_id int) returns table(type_id smallint, "id" int, "position" int, attribute_name varchar, val varchar, item_name varchar, item_id int)
        as $$
        begin
            return query select sheet_attribute.type_id, sheet_attribute.id, comparison_item.position, sheet_attribute.name, attribute_value.val, comparison_item.name, comparison_item.id
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
            return query insert into sheet_attribute(name, sheet_id, position) select null, _sheet_id, position from
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

    create or replace function set_sheet_comment (_sheet_id int, _comment text) returns void
        as $$
        begin
            update sheet set comment = _comment where id = _sheet_id;
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

    create or replace function create_comparison_from_user_template (_account_id int, _template_id int, _comparison_name varchar, _num_items int default 2) returns int
        as $$
            declare _comparison_id int;
        begin
            insert into sheet (name, account_id) values (_comparison_name, _account_id) returning id into _comparison_id;
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

    create or replace function get_template (_template_id int) returns table(id int, type_id smallint, name varchar, "position" int)
        as $$
        begin
            return query
                select sheet_attribute.id, sheet_attribute.type_id, sheet_attribute.name, sheet_attribute.position from user_template
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
        declare _comparison_id int;
        declare item_0 int;
        declare item_1 int;
        declare item_2 int;

        declare comp_1 int;
        declare comp_2 int;
        declare comp_3 int;

        declare temp_1 int;
        declare temp_2 int;
        declare washer_comparison int;
        declare laptop_comparison int;

        begin

            select register_user('a@a.com', 'admin', 'password') into _account_id;
            perform register_user('test@comparator_test.com', 'a', 'a');
            insert into sheet (name, account_id) select 'balls', id from account where username = 'admin' returning id into _comparison_id;
            insert into comparison(id) values (_comparison_id);

            perform add_comparison_item_back(_comparison_id);
            perform add_comparison_item_back(_comparison_id);
            perform add_comparison_item(_comparison_id, 0, 'test item 1');
            perform add_comparison_item(_comparison_id, 1, 'test item 2');
            perform add_comparison_items(_comparison_id, 2, 2);
            perform delete_comparison_item(_comparison_id, 2);

            perform add_sheet_attribute(_comparison_id, 'size', 0::smallint);
            perform add_sheet_attribute(_comparison_id, 'color', 0::smallint);
            perform add_sheet_attribute(_comparison_id, 'number', 1::smallint);

            select id from comparison_item where position = 0 into item_0;
            select id from comparison_item where position = 1 into item_1;
            select id from comparison_item where position = 2 into item_2;

            update comparison_item set name = 'balls 1' where position = 0 and comparison_id = _comparison_id;
            update comparison_item set name = 'balls 2' where position = 1 and comparison_id = _comparison_id;
            update comparison_item set name = 'balls 3' where position = 2 and comparison_id = _comparison_id;


            perform set_comparison_attribute_value(item_0, (select id from sheet_attribute where name = 'size' and sheet_id = _comparison_id), 'large');
            perform set_comparison_attribute_value(item_0, (select id from sheet_attribute where name = 'color' and sheet_id = _comparison_id), 'red');
            perform set_comparison_attribute_value(item_0, (select id from sheet_attribute where name = 'number' and sheet_id = _comparison_id), '-1.32');

            perform set_comparison_attribute_value(item_1, (select id from sheet_attribute where name = 'size' and sheet_id = _comparison_id), 'small');
            perform set_comparison_attribute_value(item_1, (select id from sheet_attribute where name = 'color' and sheet_id = _comparison_id), 'blue');
            perform set_comparison_attribute_value(item_1, (select id from sheet_attribute where name = 'number' and sheet_id = _comparison_id), '3');

            perform set_comparison_attribute_value(item_2, (select id from sheet_attribute where name = 'size' and sheet_id = _comparison_id), 'medium');
            perform set_comparison_attribute_value(item_2, (select id from sheet_attribute where name = 'color' and sheet_id = _comparison_id), 'green');
            perform set_comparison_attribute_value(item_2, (select id from sheet_attribute where name = 'number' and sheet_id = _comparison_id), '-8.221');


            perform save_comparison_as_template(_comparison_id, 'balls template 1');
            perform save_comparison_as_template(_comparison_id, 'balls template 2');
            perform save_comparison_as_template(_comparison_id, 'balls template 3');

            select create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 2') into comp_1;
            select create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 3') into comp_2;
            select create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 4') into comp_3;
            perform create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 4', 2);

            perform add_comparison_item_back(comp_1, 3);
            perform add_comparison_item_back(comp_2, 4);
            perform add_comparison_item_back(comp_3, 5);

            select make_template(1, 'Top Load Washers', Array[1, 1, 0, 4, 1, 1, 0]::smallint[],
                                  Array['price', 'capacity', 'color', 'wash time', 'water efficiency', 'energy efficiency', 'type']) into temp_1;
            select make_template(1, 'Laptops', Array[1, 0, 1, 1, 1, 1, 0, 4]::smallint[],
                                  Array['Price', 'Operating System', 'Memory', 'Hard Drive', 'Graphics Card', 'Weight', 'Size', 'Battery Life']) into temp_2;
            perform make_template(1, 'Cameras', Array[1, 1, 1, 4, 4, 1, 0, 1, 4]::smallint[],
                                  Array['Price', 'Megapixels', 'Image Quality','Shutter Lag', 'Startup Time', 'Weight', 'Size', 'Storage Space', 'Battery Life']);

            select create_comparison_from_user_template(_account_id, temp_1, 'Top Load Washers', 3) into washer_comparison;
            update comparison_item set name = 'washer 1' where position = 0 and comparison_id = washer_comparison;
            update comparison_item set name = 'washer 2' where position = 1 and comparison_id = washer_comparison;
            update comparison_item set name = 'washer 3' where position = 2 and comparison_id = washer_comparison;

            perform create_comparison_from_user_template(_account_id, temp_2, 'Laptops', 3);

            perform create_empty_comparison('empty comparison 1', _account_id);
            perform create_empty_template('empty template 1', _account_id);
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
# TODO: consider function to import csv (both for allowing imports of exported tables/csv tables in general, and to ease example making)

def initialize_db_values():
    query = text("""
        select initialize_db_values()
    """)
    db.engine.execute(query.execution_options(autocommit=True))

# returns 1 for valid registration parameters, 2 for invalid email, 3 for invalid username
def validate_registration(email, username):
    from models import Account

    # TODO: see if better way to complete function as unique constraints checked upon insert anyway (conditional on error message?)

    if db.engine.execute((select([Account.id]).where(Account.email == email))).rowcount > 0:
        # DUPLICATE EMAIL
        return 2
    elif db.engine.execute((select([Account.id]).where(Account.username == username))).rowcount > 0:
        # DUPLICATE USERNAME
        return 3
    return 1

def register_user(email, username, password):
    query = text("""select register_user(:email, :username, :password)""")
    db.engine.execute(query.execution_options(autocommit=True), email=email, username=username, password=password)

def set_password(user_id, password):
    query = text("""select set_password(:user_id, :password)""")
    db.engine.execute(query.execution_options(autocommit=True), user_id=user_id, password=password)

# returns true if login credentials valid, false otherwise
def validate_login(username, password):
    query = text("""select validate_login(:username, :password)""")
    return db.engine.execute(query, username=username, password=password).scalar()

# returns array of template ids for specified user
def get_user_template_ids(user_id, get_json=True):
    result = get_user_templates(user_id)
    output = [row['id'] for row in result]

    if get_json:
        return json.dumps(output)
    return output

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

# TODO: delete once code changed to use get_user_comparisons
# returns array of all comparison names of specified user
def get_user_comparison_names(user_id, get_json=True):
    query = text("""
        select name from Comparison inner join Sheet using(id) where Sheet.account_id = :user_id;
        """)
    result = db.engine.execute(query, user_id=user_id)
    output = [row['name'] for row in result]

    if get_json:
        return json.dumps(output)
    return output

# returns values of comparison table for specified user
def get_user_comparisons(user_id, get_json=True):
    query = text("""
        select * from Comparison inner join Sheet using(id) where Sheet.account_id = :user_id;
        """)
    result = db.engine.execute(query, user_id=user_id)
    if get_json:
        return jsonify_table(result)
    return result

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

def add_sheet_attribute(sheet_id, attribute_name, type_id, weight=1):
    query = text("""
    select add_sheet_attribute(:sheet_id, :attribute_name, :type_id, :weight);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, attribute_name=attribute_name, type_id=type_id, weight=weight).scalar()

def add_sheet_attribute_back (sheet_id, num_attributes=1, get_json=True):
    query = text("""
    select add_sheet_attribute_back (:sheet_id, :num_attributes)
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, num_attributes=num_attributes)

    if num_attributes == 1:
        return result.scalar()

    if get_json:
        return jsonify_column(result)
    return result

def add_sheet_attributes(sheet_id, position, num_attributes, get_json=True):
    query = text("""
    select add_sheet_attributes (:sheet_id, :position, :num_attributes)
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, position=position, num_attributes=num_attributes)
    if get_json:
        return jsonify_column(result)
    return result

def set_comparison_attribute_value(item_id, attribute_id, new_value):
    query = text("""
    select set_comparison_attribute_value(:item_id, :attribute_id, :new_value);
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, attribute_id=attribute_id, new_value=new_value)

# saves specified comparison as template with given name, returns new template id
def save_comparison_as_template(comparison_id, template_name):
    query = text("""
    select save_comparison_as_template(:comparison_id, :template_name);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, template_name=template_name).scalar()

def add_comparison_item(comparison_id, position, name=None):
    query = text("""
    select add_comparison_item(:comparison_id, :position, :name);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, position=position, name=name).scalar()

def add_comparison_item_back (comparison_id, num_items=1, get_json=True):
    query = text("""
    select add_comparison_item_back(:comparison_id, :num_items);
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, num_items=num_items)
    if num_items == 1:
        return result.scalar()

    if get_json:
        return jsonify_column(result)
    return result

def add_comparison_items (comparison_id, position, num_items=1, get_json=True):
    query = text("""
    select add_comparison_items (:comparison_id, :num_items, :position)
    """)
    result = db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, position=position, num_items=num_items)
    if get_json:
        return jsonify_column(result)
    return result

def swap_comparison_item (id1, id2):
    query = text("""
    select swap_comparison_item (:id1, :id2);
    """)
    db.engine.execute(query.execution_options(autocommit=True), id1=id1, id2=id2)

def delete_comparison_item_by_position (comparison_id, position):
    query = text("""
    select delete_comparison_item(:comparison_id, :position);
    """)
    db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, position=position)

def delete_comparison_item_by_id (id):
    query = text("""
    select delete_comparison_item(:id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), id=id)

def get_comparison (comparison_id, get_json=True):
    query = text("""
    select * from comparison_table_stacked(:comparison_id);
    """)

    result = db.engine.execute(query, comparison_id=comparison_id)
    if get_json:
        curr_position = -1
        data = {}
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
            item[str(row[1])] = row[4]
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

def create_comparison_from_user_template (account_id, template_id, comparison_name, num_items=2):
    query = text("""
    select create_comparison_from_user_template(:account_id, :template_id, :comparison_name, :num_items);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), account_id=account_id, template_id=template_id, comparison_name=comparison_name, num_items=num_items).scalar()

# sorts comparison by specified attribute (ascending)
def sort_by_attribute(attribute_id):
    query = text("""
    select sort_by_attribute(:attribute_id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), attribute_id=attribute_id)

# sorts comparison items by ordering determined by inputted list of ordered comparison_item id's
def sort_by_item_ordering(ordering):
    query = text("""
    select sort_by_item_ordering(:ordering);
    """)
    db.engine.execute(query.execution_options(autocommit=True), ordering=ordering)

# sorts sheet (comparison or template) attributes by ordering (list of attribute id's)
def sort_by_attribute_ordering(ordering):
    query = text("""
    select sort_by_attribute_ordering(:ordering);
    """)
    db.engine.execute(query.execution_options(autocommit=True), ordering=ordering)

# WARNING: vulnerable to sql injection if users given access (as field string not checked)
# valid fields are name, type_id, weight (id and comparison_id should probably not be changed)
def set_sheet_attribute_field(attribute_id, field, field_value):
    query = text("""
    update sheet_attribute set """ + field + """ = :field_value where id = :attribute_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), field_value=field_value, attribute_id=attribute_id)

def set_item_name(item_id, name):
    query = text("""
    update comparison_item set name = :name where id = :item_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, name=name)

def set_sheet_comment(sheet_id, comment):
    query = text("""
    select set_sheet_comment(:sheet_id, :comment);
    """)
    db.engine.execute(query.execution_options(autocommit=True), sheet_id=sheet_id, comment=comment)

def get_template(id, get_json=True):
    query = text("""
    select * from get_template(:id);
    """)
    result = db.engine.execute(query, id=id)
    if get_json:
        attributes = []
        for row in result:
            attribute = {}
            attribute['name'] = row[2]
            attribute['type_id'] = row[1]
            attribute['id'] = row[0]
            attributes.append(attribute)
        return json.dumps(attributes)
    return result

# copies template into specified account, returns new template id
def copy_template(template_id, account_id):
    query = text("""
    select * from copy_template(:template_id, :account_id);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), template_id=template_id, account_id=account_id).scalar()

# copies comparison into specified account, returns comparison id
def copy_comparison (comparison_id, account_id):
    query = text("""
    select * from copy_comparison(:comparison_id, :account_id);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, account_id=account_id).scalar()

# TODO: change to return array of row dicts
# takes in ResultProxy from executed query, returns json array of rows mapping column names to values
def jsonify_table(result):
    data = []
    columns = result.keys()

    for row in result:
        temp = {}
        for i in range(len(columns)):
            temp[columns[i]] = row[i]
        data.append(temp)
    return json.dumps(data)

# returns simple json array for single column result
def jsonify_column(result):
    data = []
    for row in result:
        data.append(row[0])
    return json.dumps(data)

# TODO: truncate table stored function for faster dropping of all data (or check if heroku has alternative)
if __name__ == '__main__':
    initialize_db_structure()
    initialize_db_values()


# TODO: improve documentation
# TODO: consider changing schema so that attributes inherit from common table to reduce redundant functions
    # single inheritance for attribute downsides:
        # unique constraint for (name, comparison_id) can't be enforced easily
        # queries slightly more complex
# TODO: export and share (csv, png, xlsx), encrypt by encrypting by user id + secret id
# TODO: update comparison_table_stacked to also return attribute weight
# TODO: consider changing functions to return errors for invalid id's (like get_comparison and get_template)
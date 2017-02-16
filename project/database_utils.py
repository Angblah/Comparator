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
    CREATE EXTENSION IF NOT EXISTS tablefunc;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    create or replace function add_comparison_item (table_comparison_id int, table_position int) returns void
    as $$
      begin
    
          update comparison_item set position = position + 1 where comparison_id = table_comparison_id and position >= table_position;
          insert into comparison_item (position, comparison_id) values (table_position, table_comparison_id);
          update comparison set last_position = last_position + 1, date_modified = current_timestamp where id = table_comparison_id;
      end;
    $$ language plpgsql;

    -- adds one item to back of specified comparison table
    create or replace function add_comparison_item_back (_comparison_id int) returns void
        as $$
        begin
            perform add_comparison_item_back(_comparison_id, 1);
        end;
    $$ language plpgsql;

    -- adds specified number of items to comparison table
    create or replace function add_comparison_item_back (_comparison_id int, _num_items int) returns void
        as $$
        -- NOTE: sequence is not used as item position may start from 0
        declare _position int;
        begin
            select last_position from comparison where id = _comparison_id into _position;

            for i in 1.._num_items loop
                _position = _position + 1;
                insert into comparison_item (position, comparison_id) values (_position, _comparison_id);
            end loop;

            update comparison set last_position = last_position + _num_items, date_modified = current_timestamp where id = _comparison_id;

        end;
    $$ language plpgsql;
    
    create or replace function delete_comparison_item (table_comparison_id int, table_position int) returns void
        as $$
        begin
            update comparison set last_position = last_position - 1, date_modified = current_timestamp where id = table_comparison_id;
            delete from comparison_item where comparison_id = table_comparison_id and position = table_position;
            update comparison_item set position = position - 1 where comparison_id = table_comparison_id and position > table_position;
        end;
    $$ language plpgsql;
    
    create or replace function comparison_table_stacked (table_comparison_id int) returns table(type_id smallint, "id" int, "position" int, "name" varchar, val varchar)
        as $$
        begin
            return query select comparison_attribute.type_id, comparison_attribute.id, comparison_item.position, comparison_attribute.name, attribute_value.val
            from comparison
                inner join comparison_attribute on comparison.id = comparison_attribute.comparison_id
                inner join comparison_item on comparison.id = comparison_item.comparison_id
                left join attribute_value on comparison_item.id = attribute_value.item_id and comparison_attribute.id = attribute_value.attribute_id
                where comparison.id = table_comparison_id
                order by position, attribute_id;
        end;
    $$ language plpgsql;

    
    
    create or replace function add_comparison_attribute (table_comparison_id int, attribute_name varchar(255), attribute_type_id smallint, _weight int default 1) returns void
        as $$
        begin
            insert into comparison_attribute (name, type_id, comparison_id, weight) values (attribute_name, attribute_type_id, table_comparison_id, _weight);
            update comparison set date_modified = current_timestamp where id = table_comparison_id;
        end;
    $$ language plpgsql;
    
    create or replace function set_comparison_attribute_value (comparison_item_id int, item_attribute_id int, new_value varchar(255)) returns void
        as $$
        begin
            insert into attribute_value (item_id, attribute_id, val) values (comparison_item_id, item_attribute_id, new_value)
                on conflict (item_id, attribute_id) do update
                    set val = new_value;
            update comparison set date_modified = current_timestamp where id = (select comparison_id from comparison_item where comparison_item.id = comparison_item_id);
        end;
    $$ language plpgsql;

    
    create or replace function get_user_comparisons (_account_id int) returns table(_id int, _name varchar)
        as $$
        begin
            return query select id, name from comparison where account_id = _account_id;
        end;
    $$ language plpgsql;
    
    create or replace function save_comparison_as_template (_comparison_id int, _template_name varchar) returns int
        as $$
            declare _user_template_id int;
        begin
            insert into user_template (name, account_id) select _template_name, account_id from comparison where id = _comparison_id returning id into _user_template_id;
            insert into user_template_attribute (name, type_id, user_template_id, weight) select name, type_id, _user_template_id, weight from comparison_attribute where comparison_id = _comparison_id;
            return _user_template_id;
        end;
    $$ language plpgsql;

    create or replace function create_comparison_from_user_template (_account_id int, _template_id int, _comparison_name varchar) returns int
        as $$
            declare _comparison_id int;
        begin
            insert into comparison (name, account_id) values (_comparison_name, _account_id) returning id into _comparison_id;
            insert into comparison_attribute (name, type_id, comparison_id, weight) select name, type_id, _comparison_id, weight from user_template_attribute where user_template_id = _template_id;
            return _comparison_id;
        end;
    $$ language plpgsql;

    create or replace function add_user_template_attribute (_user_template_id int, _attribute_name varchar, _type_id smallint, _weight int default 1) returns void
        as $$
        begin
            insert into user_template_attribute (name, type_id, user_template_id, weight) values (_attribute_name, _type_id, _user_template_id, _weight);
            update user_template set date_modified = current_timestamp where id = _user_template_id;
        end;
    $$ language plpgsql;

    -- NOTE: all arrays must be of same length, though this will NOT be checked by stored function
    -- NOTE: 1st index of array is "1", NOT "0"
    create or replace function make_template (_template_name varchar, _type_ids smallint[], _type_names varchar[], _weights int[]) returns int
        as $$
            declare _template_id int;
        begin
            insert into user_template (name, account_id) values (_template_name, (select id from account where username = 'admin')) returning id into _template_id;
            for i in 1..cardinality(_type_ids) loop
                insert into user_template_attribute (name, type_id, user_template_id, weight) values (_type_names[i], _type_ids[i], _template_id, _weights[i]);
            end loop;
            return _template_id;
        end;
    $$ language plpgsql;

    -- NOTE: all arrays must be of same length, though this will NOT be checked by stored function
    -- NOTE: 1st index of array is "1", NOT "0"
    create or replace function make_template (_template_name varchar, _type_ids smallint[], _type_names varchar[]) returns int
        as $$
            declare _template_id int;
        begin
            insert into user_template (name, account_id) values (_template_name, (select id from account where username = 'admin')) returning id into _template_id;
            for i in 1..cardinality(_type_ids) loop
                insert into user_template_attribute (name, type_id, user_template_id) values (_type_names[i], _type_ids[i], _template_id);
            end loop;
            return _template_id;
        end;
    $$ language plpgsql;

    create or replace function get_template (_template_id int) returns table(id int, type_id smallint, name varchar)
        as $$
        begin
            return query
                select user_template_attribute.id, user_template_attribute.type_id, user_template_attribute.name from user_template
                    inner join user_template_attribute
                    on user_template.id = user_template_attribute.user_template_id
                    where user_template.id = _template_id;
        end;
    $$ language plpgsql;

    create or replace function copy_comparison (_comparison_id int, _account_id int) returns int
        as $$
            declare new_comparison_id int;
        begin
            insert into comparison (name, last_position, comment, account_id) select name || ' (copy)', last_position, comment, account_id from comparison where id = _account_id returning id into new_comparison_id;

            with attribute_ids as (
            select id as attribute_id, name, type_id, weight, row_number() over () from comparison_attribute where comparison_id = _comparison_id
            ),
            item_ids as (
                select id as item_id, position, row_number() over () from comparison_item where comparison_id = _comparison_id
            ),
            ins1 as (
                insert into comparison_attribute (name, type_id, comparison_id, weight) select name, type_id, new_comparison_id, weight from attribute_ids returning id as attribute_ins_id
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
            insert into user_template (name, comment, account_id) select name || ' (copy)', comment, _account_id from user_template where id = _template_id returning id into _new_template_id;
            insert into user_template_attribute (name, type_id, user_template_id, weight) select name, type_id, _new_template_id, weight from user_template_attribute where user_template_id = _template_id;
            return _new_template_id;
        end;
    $$ language plpgsql;

    /*
    Function taken from Erwin Brandstetter's response on http://stackoverflow.com/questions/36804551/execute-a-dynamic-crosstab-query
    Creates view xtab_view containing pivot table result
    */
    CREATE OR REPLACE FUNCTION xtab(_tbl regclass, _row text, _cat text
                                  , _expr text  -- still vulnerable to SQL injection!
                                  , _type regtype) RETURNS text AS
        $func$
        DECLARE
           _cat_list text;
           _col_list text;
        BEGIN
    
        -- generate categories for xtab param and col definition list
        EXECUTE format(
         $$SELECT string_agg(quote_literal(x.cat), '), (')
                , string_agg(quote_ident  (x.cat), %L)
           FROM  (SELECT DISTINCT %I::text AS cat FROM %s ORDER BY 1) x$$
         , ' ' || _type || ', ', _cat, _tbl)
        INTO  _cat_list, _col_list;
    
        -- generate query string
        RETURN format(
          -- DROP VIEW used instead of CREATE OR REPLACE as column names may change between function calls
          'DROP VIEW IF EXISTS xtab_view;
           CREATE TEMP VIEW xtab_view AS SELECT * FROM crosstab(
           $q$
               SELECT %I, %I, %s
               FROM   %I
               order by 1, 2
           $q$
         , $c$VALUES (%5$s)$c$
           ) ct(%1$I text, %6$s %7$s)'
        , _row, _cat, _expr  -- expr must be an aggregate expression!
        , _tbl, _cat_list, _col_list, _type
        );
    
        END
        $func$ LANGUAGE plpgsql;
    
    /*
        Adapted from xtab function above, specifically for creating comparison table view, comparison_table_horizontal, for specified table_comparison_id
        WARNING: Table must have at least 1 item or this function will throw an error
    */
    CREATE OR REPLACE FUNCTION create_comparison_table_horizontal(table_comparison_id int) RETURNS text AS
        $func$
        DECLARE
           _cat_list text;
           _col_list text;
        BEGIN

        -- generate categories for xtab param and col definition list
        EXECUTE format(
         $$SELECT string_agg(quote_literal(x.cat), '), (')
                , string_agg(quote_ident  (x.cat), %L)
           FROM  (SELECT generate_series::text AS cat FROM generate_series(0, (SELECT last_position FROM comparison where id = %s))) x$$
         , ' ' || 'varchar(255)' || ', ', table_comparison_id)
        INTO  _cat_list, _col_list;

        -- generate query string
        RETURN format(
          -- DROP VIEW used instead of CREATE OR REPLACE as column names may change between function calls
          'DROP VIEW IF EXISTS comparison_table_horizontal;
           CREATE TEMP VIEW comparison_table_horizontal AS SELECT * FROM crosstab(
           $q$
               SELECT id, type_id, name, position, val
               FROM   (select * from comparison_table_stacked(%3$s)) as t1
               order by id
           $q$
         , $c$VALUES (%1$s)$c$
           ) ct(id int, type_id smallint, name text, %2$s varchar(255))'
        , _cat_list, _col_list, table_comparison_id
        );
        END
        $func$ LANGUAGE plpgsql;
    
    -- Sorts specified comparison by specified attribute (ascending)
    -- NOTE: dynamic sql used as you cannot use order by case with casting to different types as column types cannot differ
    -- TODO: try to make more efficient (maybe use sequence instead of row number, combine with dynamic sql portion?)
    -- TODO: consider separating sort update into helper function to take in any list of attribute ids
    -- TODO: look into whether joins would be more efficient (check explain statements)
    create or replace function sort_by_attribute(_comparison_id int, _attribute_id int) returns void as
    $$
    declare _type_id smallint;
    declare _type varchar;
    begin
        select type_id from comparison_attribute where id = _attribute_id into _type_id;
    
        select sort_type from data_type where id = _type_id into _type;
    
        execute format('create or replace temp view sort_view as select comparison_item.id as _item_id from comparison_attribute
            inner join comparison_item on comparison_attribute.comparison_id = comparison_item.comparison_id
            left join attribute_value on attribute_value.item_id = comparison_item.id and attribute_value.attribute_id = comparison_attribute.id
            where comparison_attribute.comparison_id = %s and comparison_attribute.id = %s
            order by val::%s', _comparison_id, _attribute_id, _type);
    
        update comparison_item set position = row_number - 1
        from (select row_number() over (), * from sort_view) as t
        where comparison_id = _comparison_id and comparison_item.id = _item_id;

        update comparison set date_modified = current_timestamp where id = _comparison_id;
    
    end;
    $$ language plpgsql;

    create or replace function register_user(_email varchar, _username varchar, _password varchar, out _account_id int) returns int as
    $$
        begin
            insert into account (email, username, password) values (_email, _username, crypt(_password, gen_salt('bf', 8))) returning id into _account_id;
        end;
    $$ language plpgsql;

    create or replace function set_password(_user_id int, _password varchar) returns void as
    $$
        begin
            update account set password = crypt(_password, gen_salt('bf', 8)) where id = _user_id;
        end;
    $$ language plpgsql;

    create or replace function validate_login(_username varchar, _password varchar) returns boolean as
    $$
        declare _passhash varchar;
        begin
            select password from account where username = _username into _passhash;
            if found then
                return _passhash = crypt(_password, _passhash);
            else
                return found;
            end if;

        end;
    $$ language plpgsql;

    
    create or replace function populate_database() returns void as
    $$
        begin
            insert into data_type (id, sort_type, type_name) values (0, 'vachar', 'varchar'), (1, 'decimal', 'decimal'), (2, 'timestamptz', 'timestamptz'), (3, 'varchar', 'image'), (4, 'interval', 'duration');
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

        begin

            select register_user('a@a.com', 'admin', 'password') into _account_id;
            perform register_user('b@b.com', 'a', 'a');
            perform register_user('awu68@gatech.edu', 'awu68', 'a');
            perform register_user('honeychawla96@gmail.com', 'honey', 'police');

            insert into comparison (name, account_id) select 'balls', id from account where username = 'admin' returning id into _comparison_id;

            -- TODO: have all add items return id of inserted item

            perform add_comparison_item_back(_comparison_id);
            perform add_comparison_item_back(_comparison_id);
            perform add_comparison_item(_comparison_id, 0);
            perform add_comparison_item(_comparison_id, 1);
            perform delete_comparison_item(_comparison_id, 2);

            perform add_comparison_attribute(_comparison_id, 'name', 0::smallint);
            perform add_comparison_attribute(_comparison_id, 'size', 0::smallint);
            perform add_comparison_attribute(_comparison_id, 'color', 0::smallint);
            perform add_comparison_attribute(_comparison_id, 'number', 1::smallint);

            select id from comparison_item where position = 0 into item_0;
            select id from comparison_item where position = 1 into item_1;
            select id from comparison_item where position = 2 into item_2;


            perform set_comparison_attribute_value(item_0, (select id from comparison_attribute where name = 'name' and comparison_id = _comparison_id), 'ball 2');
            perform set_comparison_attribute_value(item_0, (select id from comparison_attribute where name = 'size' and comparison_id = _comparison_id), 'large');
            perform set_comparison_attribute_value(item_0, (select id from comparison_attribute where name = 'color' and comparison_id = _comparison_id), 'red');
            perform set_comparison_attribute_value(item_0, (select id from comparison_attribute where name = 'number' and comparison_id = _comparison_id), '-1.32');

            perform set_comparison_attribute_value(item_1, (select id from comparison_attribute where name = 'name' and comparison_id = _comparison_id), 'ball 3');
            perform set_comparison_attribute_value(item_1, (select id from comparison_attribute where name = 'size' and comparison_id = _comparison_id), 'small');
            perform set_comparison_attribute_value(item_1, (select id from comparison_attribute where name = 'color' and comparison_id = _comparison_id), 'blue');
            perform set_comparison_attribute_value(item_1, (select id from comparison_attribute where name = 'number' and comparison_id = _comparison_id), '3');

            perform set_comparison_attribute_value(item_2, (select id from comparison_attribute where name = 'name' and comparison_id = _comparison_id), 'ball 4');
            perform set_comparison_attribute_value(item_2, (select id from comparison_attribute where name = 'size' and comparison_id = _comparison_id), 'medium');
            perform set_comparison_attribute_value(item_2, (select id from comparison_attribute where name = 'color' and comparison_id = _comparison_id), 'green');
            perform set_comparison_attribute_value(item_2, (select id from comparison_attribute where name = 'number' and comparison_id = _comparison_id), '-8.221');

            perform add_comparison_item(_comparison_id, 2);
            perform add_comparison_item_back(_comparison_id);


            perform save_comparison_as_template(_comparison_id, 'balls template 1');
            perform save_comparison_as_template(_comparison_id, 'balls template 2');
            perform save_comparison_as_template(_comparison_id, 'balls template 3');

            -- TODO: fix create_comparison_stacked as table has values for comp_1, comp_2, and comp_3
            select create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 2') into comp_1;
            select create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 3') into comp_2;
            select create_comparison_from_user_template(_account_id, (select id from user_template limit 1), 'balls 4') into comp_3;

            perform add_comparison_item_back(comp_1, 3);
            perform add_comparison_item_back(comp_2, 4);
            perform add_comparison_item_back(comp_3, 5);

            perform make_template('Top Load Washers', Array[0, 1, 1, 0, 4, 1, 1, 0]::smallint[],
                                  Array['name', 'price', 'capacity', 'color', 'wash time', 'water efficiency', 'energy efficiency', 'type']);
            perform make_template('Laptops', Array[0, 1, 0, 1, 1, 1, 1, 0, 4]::smallint[],
                                  Array['Name', 'Price', 'Operating System', 'Memory', 'Hard Drive', 'Graphics Card', 'Weight', 'Size', 'Battery Life']);
            perform make_template('Cameras', Array[0, 1, 1, 1, 4, 4, 1, 0, 1, 4]::smallint[],
                                  Array['Name', 'Price', 'Megapixels', 'Image Quality','Shutter Lag', 'Startup Time', 'Weight', 'Size', 'Storage Space', 'Battery Life']);


            -- TODO: combine initialize and create comparison

            -- TODO: create a few templates

        end;
    $$ language plpgsql;


    """)
    db.engine.execute(query.execution_options(autocommit=True))

# TODO: change default comparisons + templates for admin to be actual defaults instead of balls
# TODO: consider function to import csv (both for allowing imports of exported tables/csv tables in general, and to ease example making)

def initialize_db_values():
    query = text("""
        select populate_database();
        select populate_database_test_values();
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
def get_user_template_ids(user_id):
    from models import UserTemplate
    result = db.engine.execute((select([UserTemplate.id]).where(UserTemplate.account_id == user_id)))
    return [row[0] for row in result]

# returns horizontal view of comparison table with specified id
# attribute id's and names are the left columns of each row, and all other columns represent an item in the comparison
# column headers are 'id' (referring to attribute id) and 'name' (attribute name), and each item position (0..n), from left to right
def get_comparison_horizontal(comparison_id, get_json=True):
    query = text("""
    do $$ begin
        execute create_comparison_table_horizontal(:id);
    end $$;
    select * from comparison_table_horizontal;
    """)
    result = db.engine.execute(query, id=comparison_id)
    if get_json:
        data = {}
        attributes = []
        num_items = len(result.keys()) - 3
        items = [{} for i in range(num_items)]
        for row in result:
            attribute = {}
            attribute['name'] = row[2]
            attribute['type_id'] = row[1]
            attribute['id'] = row[0]
            attributes.append(attribute)
            for i in range(num_items):
                val = row[i + 3]
                items[i][row[2]] = val
        data['attributes'] = attributes
        data['items'] = items
        return json.dumps(data)
    return result

# returns array of all comparison ids of specified user
def get_user_comparison_ids(user_id):
    from models import Comparison

    result = db.engine.execute((select([Comparison.id]).where(Comparison.account_id == user_id)))
    return [row[0] for row in result]

# returns array of all comparison names of specified user
def get_user_comparison_names(user_id):
    from models import Comparison

    result = db.engine.execute((select([Comparison.name]).where(Comparison.account_id == user_id)))
    return [row[0] for row in result]

def add_comparison_attribute(comparison_id, attribute_name, attribute_type_id):
    query = text("""
    select add_comparison_attribute(:comparison_id, :attribute_name, :attribute_type_id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, attribute_name=attribute_name, attribute_type_id=attribute_type_id)

def set_comparison_attribute_value(item_id, item_attribute_id, new_value):
    query = text("""
    select set_comparison_attribute_value(:item_id, :item_attribute_id, :new_value);
    """)
    db.engine.execute(query.execution_options(autocommit=True), item_id=item_id, item_attribute_id=item_attribute_id, new_value=new_value)

# saves specified comparison as template with given name, returns new template id
def save_comparison_as_template(comparison_id, template_name):
    query = text("""
    select save_comparison_as_template(:comparison_id, :template_name);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, template_name=template_name).scalar()


def add_comparison_item (table_comparison_id, table_position):
    query = text("""
    select add_comparison_item(:table_comparison_id, :table_position);
    """)
    db.engine.execute(query.execution_options(autocommit=True), table_comparison_id=table_comparison_id, table_position=table_position)

def add_comparison_item_back (comparison_id):
    query = text("""
    select add_comparison_item_back(:comparison_id)
    """)
    db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id)

def add_comparison_items_back (comparison_id, num_items):
    query = text("""
    select add_comparison_item_back(:comparison_id, :num_items);
    """)
    db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, num_items=num_items)

# TODO: consider changing to id instead of position depending on whether stacked/horizontal view chosen as final option
def delete_comparison_item (table_comparison_id, table_position):
    query = text("""
    select delete_comparison_item(:table_comparison_id, :table_position);
    """)
    db.engine.execute(query.execution_options(autocommit=True), table_comparison_id=table_comparison_id, table_position=table_position)

def comparison_table_stacked (table_comparison_id, get_json=True):
    query = text("""
    select comparison_table_stacked(:table_comparison_id);
    """)

    result = db.engine.execute(query, table_comparison_id=table_comparison_id)
    if get_json:
        return jsonify_table(result)
    return result

def create_comparison_from_user_template (account_id, template_id, comparison_name):
    query = text("""
    select create_comparison_from_user_template(:account_id, :template_id, :comparison_name);
    """)
    return db.engine.execute(query.execution_options(autocommit=True), account_id=account_id, template_id=template_id, comparison_name=comparison_name).scalar()

def sort_by_attribute(comparison_id, attribute_id):
    query = text("""
    select sort_by_attribute(:comparison_id, :attribute_id);
    """)
    db.engine.execute(query.execution_options(autocommit=True), comparison_id=comparison_id, attribute_id=attribute_id)

# valid fields are name, type_id, weight (id and comparison_id should probably not be changed)
def set_template_attribute_field(attribute_id, field, field_value):
    query = text("""
    update user_template_attribute set """ + field + """ = :field_value where id = :attribute_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), field_value=field_value, attribute_id=attribute_id)

# valid fields are name, type_id, weight (id and comparison_id should probably not be changed)
def set_comparison_attribute_field(attribute_id, field, field_value):
    query = text("""
    update comparison_attribute set """ + field + """ = :field_value where id = :attribute_id;
    """)
    db.engine.execute(query.execution_options(autocommit=True), field_value=field_value, attribute_id=attribute_id)

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


# takes in ResultProxy from executed query, returns json mapping column names to arrays of values in order
def jsonify_table(result):
    data = {}
    columns = result.keys()
    for column in columns:
        data[column] = []
    for row in result:
        for i in range(len(columns)):
            data[columns[i]].append(row[i])
    return json.dumps(data)

# TODO: truncate table stored function for faster dropping of all data (or check if heroku has alternative)
if __name__ == '__main__':
    initialize_db_structure()
    initialize_db_values()

# Example use cases

    # getting all comparison tables of specific user

    # a = get_user_comparison_ids(1)
    # for id in a:
    #     b = get_comparison_horizontal(id)
    #     # new table
    #     print("_______________________________________________")
    #     for result in b:
    #         # row in table
    #         print(result)
    #     print("_______________________________________________")



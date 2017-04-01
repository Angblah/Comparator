# coding: utf-8
from app import db
from sqlalchemy import Column, ForeignKey, Integer, SmallInteger, String, UniqueConstraint, text, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import TIMESTAMP
from flask.ext.login import UserMixin


Base = declarative_base()
metadata = Base.metadata

class Account(db.Model, UserMixin):
    __tablename__ = 'account'

    id = db.Column(Integer, primary_key=True)
    email = db.Column(String(255), nullable=False, unique=True)
    username = db.Column(String(255), nullable=False, unique=True)
    passhash = db.Column(String(255), nullable=False)

    def __init__(self, email, username, passhash):
        self.email = email
        self.username = username
        self.passhash = passhash

    def is_active(self):
        #True, all users are active
        return True

    def get_id(self):
        #Return the username to satisfy Flask-Login's requirements
        return self.username

    def is_authenticated(self):
        #TODO: Are we having user authentication?
        return True

    def is_anonymous(self):
        #Guest users won't have accounts, so this will always be false
        return False

    def __repr__(self):
        return '<Account %r>' % self.username

# NOTE:
# type_ids:
# 0 = varchar
# 1 = decimal
# 2 = timestamp
# 3 = image
# 4 = duration
class DataType(db.Model):
    __tablename__ = 'data_type'

    id = db.Column(SmallInteger, primary_key=True)
    sort_type = db.Column(String(255), nullable=False)
    type_name = db.Column(String(255), nullable=False)


class Sheet(db.Model):
    __tablename__ = 'sheet'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)
    date_modified = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))
    date_created = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))
    comment = db.Column(Text, nullable=True)
    account_id = db.Column(ForeignKey('account.id', ondelete='CASCADE'), nullable=False)

    account = relationship('Account')


class SheetAttribute(db.Model):
    __tablename__ = 'sheet_attribute'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=True)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))
    position = db.Column(Integer, nullable=False)
    sheet_id = db.Column(ForeignKey('sheet.id', ondelete='CASCADE'), nullable=False)
    type_id = db.Column(ForeignKey('data_type.id'), nullable=False, server_default=text("0"))
    UniqueConstraint(sheet_id, name)
    UniqueConstraint(sheet_id, position, deferrable=True)

    sheet = relationship('Sheet')


class Comparison(db.Model):
    __tablename__ = 'comparison'

    id = db.Column(ForeignKey('sheet.id', ondelete='CASCADE'), nullable=False, primary_key=True)

    sheet = relationship('Sheet')

class UserTemplate(db.Model):
    __tablename__ = 'user_template'

    id = db.Column(ForeignKey('sheet.id', ondelete='CASCADE'), nullable=False, primary_key=True)

    sheet = relationship('Sheet')


class ComparisonItem(db.Model):
    __tablename__ = 'comparison_item'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=True)
    position = db.Column(Integer, nullable=False)
    comparison_id = db.Column(ForeignKey('comparison.id', ondelete='CASCADE'), nullable=False)
    UniqueConstraint('comparison_id', 'position', deferrable=True)

    comparison = relationship('Comparison')

class AttributeValue(db.Model):
    __tablename__ = 'attribute_value'

    item_id = db.Column(ForeignKey('comparison_item.id', ondelete='CASCADE'), primary_key=True, nullable=False)
    attribute_id = db.Column(ForeignKey('sheet_attribute.id', ondelete='CASCADE'), primary_key=True, nullable=False)
    val = db.Column(String(255), nullable=False)
    worth = db.Column(Integer, nullable=False, server_default=text('1'))

    attribute = relationship('SheetAttribute')
    item = relationship('ComparisonItem')

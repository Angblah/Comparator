# coding: utf-8
from app import db
from sqlalchemy import Column, ForeignKey, Integer, SmallInteger, String, UniqueConstraint, text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import TIMESTAMP
from flask.ext.login import UserMixin


Base = declarative_base()
metadata = Base.metadata

class AttributeValue(db.Model):
    __tablename__ = 'attribute_value'

    item_id = db.Column(ForeignKey(u'comparison_item.id', ondelete=u'CASCADE'), primary_key=True, nullable=False)
    attribute_id = db.Column(ForeignKey(u'comparison_attribute.id', ondelete=u'CASCADE'), primary_key=True, nullable=False)
    val = db.Column(String(255), nullable=False)

    attribute = relationship(u'ComparisonAttribute')
    item = relationship(u'ComparisonItem')


class Comparison(db.Model):
    __tablename__ = 'comparison'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)
    last_position = db.Column(Integer, nullable=False, server_default=text("'-1'::integer"))
    account_id = db.Column(ForeignKey(u'account.id', ondelete=u'CASCADE'), nullable=False)
    date_modified = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))
    date_created = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))

    account = relationship(u'Account')


class ComparisonAttribute(db.Model):
    __tablename__ = 'comparison_attribute'

    id = db.Column(Integer, primary_key=True,)
    name = db.Column(String(255), nullable=False)
    type_id = db.Column(SmallInteger, nullable=False)
    comparison_id = db.Column(ForeignKey(u'comparison.id', ondelete=u'CASCADE'), nullable=False)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))

    comparison = relationship(u'Comparison')


class ComparisonItem(db.Model):
    __tablename__ = 'comparison_item'
    __table_args__ = (
        UniqueConstraint('comparison_id', 'position', deferrable=True),
    )

    id = db.Column(Integer, primary_key=True)
    position = db.Column(Integer, nullable=False)
    comparison_id = db.Column(ForeignKey(u'comparison.id', ondelete=u'CASCADE'), nullable=False)

    comparison = relationship(u'Comparison')


class DataType(db.Model):
    __tablename__ = 'data_type'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)


class Template(db.Model):
    __tablename__ = 'template'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)
    date_modified = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))
    date_created = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))


class TemplateAttribute(db.Model):
    __tablename__ = 'template_attribute'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)
    type_id = db.Column(SmallInteger, nullable=False)
    template_id = db.Column(ForeignKey(u'template.id', ondelete=u'CASCADE'), nullable=False)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))

    template = relationship(u'Template')


class UserTemplate(db.Model):
    __tablename__ = 'user_template'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)
    account_id = db.Column(ForeignKey(u'account.id', ondelete=u'CASCADE'), nullable=False)
    date_modified = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))
    date_created = db.Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("current_timestamp"))

    account = relationship(u'Account')


class UserTemplateAttribute(db.Model):
    __tablename__ = 'user_template_attribute'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)
    type_id = db.Column(SmallInteger, nullable=False)
    user_template_id = db.Column(ForeignKey(u'user_template.id', ondelete=u'CASCADE'), nullable=False)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))

    user_template = relationship(u'UserTemplate')

class Account(db.Model, UserMixin):
    __tablename__ = 'account'

    id = db.Column(Integer, primary_key=True)
    email = db.Column(String(255), nullable=False, unique=True)
    username = db.Column(String(255), nullable=False, unique=True)
    password = db.Column(String(255), nullable=False)

    def __init__(self, email, username, password):
        self.email = email
        self.username = username
        self.password = password

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
# coding: utf-8
from app import db
from sqlalchemy import Column, ForeignKey, Integer, SmallInteger, String, UniqueConstraint, text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()
metadata = Base.metadata

print 1


class Account(db.Model):
    print 2
    __tablename__ = 'account'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('account_id_seq'::regclass)"))
    email = db.Column(String(255), nullable=False, unique=True)
    username = db.Column(String(255), nullable=False, unique=True)
    password = db.Column(String(255), nullable=False)

    def __init__(self, email, username, password):
        print 3
        self.email = email
        self.username = username
        self.password = password

    def __repr__(self):
        print 4
        return '<Account %r>' % self.username


class AttributeValue(db.Model):
    __tablename__ = 'attribute_value'

    item_id = db.Column(ForeignKey(u'comparison_item.id', ondelete=u'CASCADE'), primary_key=True, nullable=False)
    attribute_id = db.Column(ForeignKey(u'comparison_attribute.id', ondelete=u'CASCADE'), primary_key=True, nullable=False)
    val = db.Column(String(255), nullable=False)

    attribute = relationship(u'ComparisonAttribute')
    item = relationship(u'ComparisonItem')


class Comparison(db.Model):
    __tablename__ = 'comparison'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('comparison_id_seq'::regclass)"))
    name = db.Column(String(255), nullable=False)
    last_position = db.Column(Integer, nullable=False, server_default=text("'-1'::integer"))
    account_id = db.Column(ForeignKey(u'account.id', ondelete=u'CASCADE'), nullable=False)

    account = relationship(u'Account')


class ComparisonAttribute(db.Model):
    __tablename__ = 'comparison_attribute'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('comparison_attribute_id_seq'::regclass)"))
    name = db.Column(String(255), nullable=False)
    type_id = db.Column(SmallInteger, nullable=False)
    comparison_id = db.Column(ForeignKey(u'comparison.id', ondelete=u'CASCADE'), nullable=False)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))

    comparison = relationship(u'Comparison')


class ComparisonItem(db.Model):
    __tablename__ = 'comparison_item'
    __table_args__ = (
        UniqueConstraint('comparison_id', 'position'),
    )

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('comparison_item_id_seq'::regclass)"))
    position = db.Column(Integer, nullable=False)
    comparison_id = db.Column(ForeignKey(u'comparison.id', ondelete=u'CASCADE'), nullable=False)

    comparison = relationship(u'Comparison')


class DataType(db.Model):
    __tablename__ = 'data_type'

    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(255), nullable=False)


class Template(db.Model):
    __tablename__ = 'template'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('template_id_seq'::regclass)"))
    name = db.Column(String(255), nullable=False)


class TemplateAttribute(db.Model):
    __tablename__ = 'template_attribute'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('template_attribute_id_seq'::regclass)"))
    name = db.Column(String(255), nullable=False)
    type_id = db.Column(SmallInteger, nullable=False)
    template_id = db.Column(ForeignKey(u'template.id', ondelete=u'CASCADE'), nullable=False)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))

    template = relationship(u'Template')


class UserTemplate(db.Model):
    __tablename__ = 'user_template'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('user_template_id_seq'::regclass)"))
    name = db.Column(String(255), nullable=False)
    account_id = db.Column(ForeignKey(u'account.id', ondelete=u'CASCADE'), nullable=False)

    account = relationship(u'Account')


class UserTemplateAttribute(db.Model):
    __tablename__ = 'user_template_attribute'

    id = db.Column(Integer, primary_key=True, server_default=text("nextval('user_template_attribute_id_seq'::regclass)"))
    name = db.Column(String(255), nullable=False)
    type_id = db.Column(SmallInteger, nullable=False)
    user_template_id = db.Column(ForeignKey(u'user_template.id', ondelete=u'CASCADE'), nullable=False)
    weight = db.Column(Integer, nullable=False, server_default=text("1"))

    user_template = relationship(u'UserTemplate')

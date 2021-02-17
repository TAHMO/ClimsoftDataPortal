from sqlalchemy import Integer, BigInteger, ForeignKey, String, Column, DateTime, Enum, Float, Text, Boolean
from sqlalchemy.orm import relationship, backref
from app.models.base import Base
from flask_security import UserMixin, RoleMixin

class AccessStation(Base):
    __tablename__ = 'portal_access_station'
    id = Column(Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('portal_user.id', ondelete="CASCADE"))
    station_id = Column('station_id', String(255), ForeignKey('station.stationId', ondelete="CASCADE"))

class AccessVariable(Base):
    __tablename__ = 'portal_access_variable'
    id = Column(Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('portal_user.id', ondelete="CASCADE"))
    variable_id = Column('variable_id', BigInteger(), ForeignKey('obselement.elementId', ondelete="CASCADE"))

class RolesUsers(Base):
    __tablename__ = 'portal_roles_users'
    id = Column(Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('portal_user.id', ondelete="CASCADE"))
    role_id = Column('role_id', Integer(), ForeignKey('portal_role.id', ondelete="CASCADE"))

class Role(Base, RoleMixin):
    __tablename__ = 'portal_role'
    id = Column(Integer(), primary_key=True)
    name = Column(String(80), unique=True)
    description = Column(String(255))

class User(Base, UserMixin):
    __tablename__ = 'portal_user'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    username = Column(String(255))
    password = Column(String(255))
    last_login_at = Column(DateTime())
    current_login_at = Column(DateTime())
    last_login_ip = Column(String(100))
    current_login_ip = Column(String(100))
    login_count = Column(Integer)
    active = Column(Boolean())
    access_stations_all = Column(Boolean())
    access_variables_all = Column(Boolean())
    access_variables_standard = Column(Boolean())
    confirmed_at = Column(DateTime())
    roles = relationship('Role', secondary='portal_roles_users',
                         backref=backref('portal_users', lazy='dynamic'))
    access_stations_specific = relationship('AccessStation', cascade="all, delete-orphan")
    access_variable_specific = relationship('AccessVariable', cascade="all, delete-orphan")
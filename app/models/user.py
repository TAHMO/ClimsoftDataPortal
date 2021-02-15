from sqlalchemy import Integer, BigInteger, ForeignKey, String, Column, DateTime, Enum, Float, Text, Boolean
from sqlalchemy.orm import relationship, backref
from app.models.base import Base
from flask_security import UserMixin, RoleMixin

class AccessStation(Base):
    __tablename__ = 'portal_access_station'
    id = Column(Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('portal_user.id'))
    station_id = Column('station_id', String(255), ForeignKey('station.stationId'))

class AccessVariable(Base):
    __tablename__ = 'portal_access_variable'
    id = Column(Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('portal_user.id'))
    variable_id = Column('variable_id', BigInteger(), ForeignKey('obselement.elementId'))

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
    admin = Column(Boolean())
    access_stations_all = Column(Boolean())
    access_variables_all = Column(Boolean())
    access_variables_standard = Column(Boolean())
    confirmed_at = Column(DateTime())
    access_stations_specific = relationship('AccessStation',
                         backref=backref('portal_users'))
    access_variable_specific = relationship('AccessVariable',
                         backref=backref('portal_users'))
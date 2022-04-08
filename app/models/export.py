import datetime
from sqlalchemy import Integer, BigInteger, ForeignKey, String, Column, DateTime, Enum, Float, Text, Boolean
from sqlalchemy.orm import relationship, backref
from app.models.base import Base

class ExportStation(Base):
    __tablename__ = 'portal_export_station'
    id = Column(Integer(), primary_key=True)
    export_id = Column('export_id', Integer(), ForeignKey('portal_export.id', ondelete="CASCADE"))
    station_id = Column('station_id', String(255), ForeignKey('station.stationId', ondelete="CASCADE"))

class ExportVariable(Base):
    __tablename__ = 'portal_export_variable'
    id = Column(Integer(), primary_key=True)
    export_id = Column('export_id', Integer(), ForeignKey('portal_export.id', ondelete="CASCADE"))
    variable_id = Column('variable_id', BigInteger(), ForeignKey('obselement.elementId', ondelete="CASCADE"))

class Export(Base):
    __tablename__ = 'portal_export'
    id = Column(Integer, primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('portal_user.id', ondelete="CASCADE"))
    created_at = Column(DateTime(), default=datetime.datetime.utcnow)
    aggregation = Column(String(3))
    startDate = Column(DateTime())
    endDate = Column(DateTime())
    description = Column(Text)
    timezone = Column(String(5))

    stations = relationship('ExportStation', cascade="all, delete-orphan")
    variables = relationship('ExportVariable', cascade="all, delete-orphan")
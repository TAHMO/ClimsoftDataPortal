from sqlalchemy import Integer, ForeignKey, String, Column, DateTime, Enum, Float, Text
from app.models.base import Base

class Station(Base):
    __tablename__ = 'station'
    stationId = Column(String, primary_key=True)
    stationName = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)

    def __str__(self):
        return "{}".format(self.stationName)

    def __repr__(self):
        return "{}: {}".format(self.stationId, self.__str__())
from sqlalchemy import Integer, ForeignKey, String, Column, DateTime, Enum, Float, Text
from app.models.base import Base

class Observation(Base):
    __tablename__ = 'observationfinal'
    recordedFrom = Column(String)
    describedBy = Column(Integer)
    obsDatetime = Column(DateTime)
    obsValue = Column(Float)
    qcStatus = Column(Integer)

    def __str__(self):
        return "{}".format(self.stationName)

    def __repr__(self):
        return "{}: {}".format(self.stationId, self.__str__())
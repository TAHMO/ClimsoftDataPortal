from sqlalchemy import Integer, ForeignKey, String, Column, DateTime, Enum, Float, Text
from app.models.base import Base

class ObservationInitial(Base):
    __tablename__ = 'observationinitial'
    recordedFrom = Column(String, primary_key=True)
    describedBy = Column(Integer, primary_key=True)
    obsDatetime = Column(DateTime, primary_key=True)
    obsValue = Column(Float)
    qcStatus = Column(Integer)

    def __str__(self):
        return "{} {} {}".format(self.obsDatetime, self.recordedFrom, self.describedBy)

    def __repr__(self):
        return "{}: {}".format(self.__str__(), self.obsValue)
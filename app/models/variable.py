from sqlalchemy import Integer, ForeignKey, String, Column, DateTime, Enum, Float, Text
from app.models.base import Base

class Variable(Base):
    __tablename__ = 'obselement'
    elementId = Column(Integer, primary_key=True)
    abbreviation = Column(String)
    elementName = Column(String)
    units = Column(String)
    elementtype = Column(String)

    def __str__(self):
        return "{}".format(self.abbreviation)

    def __repr__(self):
        return "{}: {}".format(self.elementId, self.__str__())
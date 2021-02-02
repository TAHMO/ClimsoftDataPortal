from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from app.models.base import Base

# TODO: Remove hardcoded connection URI.
engine = create_engine('mysql+pymysql://root:byMWim84CdUo@172.29.48.1/mariadb_climsoft_db_v4')

from app.models import station
from app.models import variable

DBSession = sessionmaker(bind=engine)
db = scoped_session(DBSession)
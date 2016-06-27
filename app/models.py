

#!/usr/bin/python
# -*- mode: python -*-

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine('mysql+pymysql://casey:crystal@localhost/youtubelib', convert_unicode=True, echo=False)
Base = declarative_base()
Base.metadata.reflect(engine)


from sqlalchemy.orm import relationship, backref

class User(Base):
    __table__ = Base.metadata.tables['users']


if __name__ == '__main__':
    from sqlalchemy.orm import scoped_session, sessionmaker, Query
    db_session = scoped_session(sessionmaker(bind=engine))
    for item in db_session.query(Users.id, Users.name):
        print item

"""
from app import db

class users(db.Model):
	id = db.Column(db.Integer, primary_key = True)
	email = db.Column(db.String(150), index = True, unique = True)
	first_name = db.Column(db.String(100), index = True, unique = True)
	last_name = db.Column(db.String(100), index = True, unique = True)

	def __repr__(self):
		return '<User %r>' % (self.email) #how do I return more than one column?"""

import datetime

class OperableDate():

	def __init__(self, date=datetime.datetime.now()):
		self.date = date

	def subtract_days(self, days):
		if days > 0:
			new_date = self.date - datetime.timedelta(days=days)
			return new_date.strftime("%Y-%m-%d %H:%M:%S")
		else:
			return self.date.strftime("%Y-%m-%d %H:%M:%S") 
def sortnumbers(num_list):

    class sorted_numbers:
      def __init__(self, low=None, average=None, high=None):
          self.low = low
          self.average = average
          self.high = high

      def __getitem__ (self, low, average, high):
          return self.index
          return self.low
          return self.average 
          return self.high 

    sortednum = sorted_numbers  
    total = 0;
    i = 0
    sortednum.low = 100^(10000000000000000)
    sortednum.high = -100^(10000000000000000)
    for num in num_list:
      total = total + int(num)
      if int(num) < sortednum.low:
        sortednum.low = int(num)
      if int(num) > sortednum.high:
        sortednum.high = int(num)
        i = i+1;
    if i>0:
      sortednum.average = total/i
    else:
      sortednum.average = total

    return sortednum;
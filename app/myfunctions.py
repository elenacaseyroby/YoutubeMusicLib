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

def getregressionline(array_of_points):
  n = 0
  sumx = 0
  sumy = 0
  sumxsquared = 0
  sumxy = 0
  for point in array_of_points:
    if point[0] > 0:
      n = n + 1
      sumx = sumx + point[0]
      sumy = sumy + point[1]
      sumxsquared = sumxsquared + point[0]*point[0]
      sumxy = sumxy + point[0]*point[1]

  m_top = float(sumxy - (sumy*(sumx/n)))
  m_bottom = float(sumxsquared - (sumx*(sumx/n)))
  m = float(m_top/m_bottom)
  b_top = float(sumy - m*sumx)
  b_bottom = float(n)
  b = float(b_top/b_bottom)

  regression_line = {'m':m, 'b':b}

  return regression_line
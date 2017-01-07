def get_regression_line(array_of_points):
    if array_of_points[0][0] == 0 and array_of_points[0][1] == 0:
        regression_line = {'m': 0, 'b': 0}
        return regression_line
    else:
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
                sumxsquared = sumxsquared + point[0] * point[0]
                sumxy = sumxy + point[0] * point[1]
        m_top = float(sumxy - (sumy * (sumx / n)))
        m_bottom = float(sumxsquared - (sumx * (sumx / n)))
        if m_bottom == 0 and m_top == 0:
            m = 0
        else:
            m = float(m_top / m_bottom)
        b_top = float(sumy - m * sumx)
        b_bottom = float(n)
        if b_bottom == 0 and b_top == 0:
            b = 0
        else:
            b = float(b_top / b_bottom)
        # where y = m * x + b
        regression_line = {'m': m, 'b': b}
        return regression_line

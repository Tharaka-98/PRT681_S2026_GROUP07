-- Week 3 - Reporting Query Practice

-- Daily volume
SELECT RequestDate, COUNT(*) AS Requests
FROM ServiceRequests
GROUP BY RequestDate
ORDER BY RequestDate;

-- Average handling time by request type
SELECT RequestType, AVG(CAST(HandlingMinutes AS DECIMAL(10,2))) AS AvgHandlingMinutes
FROM ServiceRequests
GROUP BY RequestType
ORDER BY AvgHandlingMinutes DESC;

-- Region performance summary
SELECT Region,
       COUNT(*) AS TotalRequests,
       SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) AS ClosedRequests,
       SUM(CASE WHEN Status <> 'Closed' THEN 1 ELSE 0 END) AS OpenRequests
FROM ServiceRequests
GROUP BY Region;

-- Requests needing attention
SELECT RequestID, RequestDate, RequestType, Region, HandlingMinutes
FROM ServiceRequests
WHERE Status <> 'Closed' OR HandlingMinutes > 60
ORDER BY HandlingMinutes DESC;

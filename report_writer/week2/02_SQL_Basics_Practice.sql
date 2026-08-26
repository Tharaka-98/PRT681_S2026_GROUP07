-- Week 2 SQL Basics Practice
-- Scenario: IT support tickets

CREATE TABLE SupportTickets (
    TicketID INT,
    Category VARCHAR(40),
    Priority VARCHAR(15),
    Status VARCHAR(20),
    AssignedTeam VARCHAR(30),
    ResolutionHours DECIMAL(6,2)
);

-- View selected fields
SELECT TicketID, Category, Priority, Status
FROM SupportTickets;

-- Filter high-priority open work
SELECT *
FROM SupportTickets
WHERE Priority = 'High' AND Status <> 'Closed';

-- Sort longest resolution times first
SELECT TicketID, Category, ResolutionHours
FROM SupportTickets
WHERE Status = 'Closed'
ORDER BY ResolutionHours DESC;

-- Count tickets by category
SELECT Category, COUNT(*) AS TicketCount
FROM SupportTickets
GROUP BY Category
ORDER BY TicketCount DESC;

-- Average resolution time for completed work
SELECT AssignedTeam, AVG(ResolutionHours) AS AvgResolutionHours
FROM SupportTickets
WHERE Status = 'Closed'
GROUP BY AssignedTeam;

-- Conditional label
SELECT TicketID,
       CASE WHEN ResolutionHours <= 8 THEN 'Within 8 hours'
            WHEN ResolutionHours <= 24 THEN 'Within 24 hours'
            ELSE 'Over 24 hours' END AS ResolutionBand
FROM SupportTickets
WHERE Status = 'Closed';

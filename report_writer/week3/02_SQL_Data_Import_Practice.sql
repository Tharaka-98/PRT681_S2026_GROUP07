-- Week 3 - SQL Data Import Practice
-- Example target table for service request CSV data

CREATE TABLE ServiceRequests (
    RequestID INT PRIMARY KEY,
    RequestDate DATE,
    Channel VARCHAR(20),
    RequestType VARCHAR(50),
    Region VARCHAR(30),
    Status VARCHAR(20),
    HandlingMinutes INT
);

-- Example for SQL Server after preparing a CSV file:
-- BULK INSERT ServiceRequests
-- FROM 'C:\Data\service_requests.csv'
-- WITH (
--     FIRSTROW = 2,
--     FIELDTERMINATOR = ',',
--     ROWTERMINATOR = '0x0a',
--     TABLOCK
-- );

-- Validation checks after import
SELECT COUNT(*) AS ImportedRows FROM ServiceRequests;
SELECT MIN(RequestDate) AS FirstDate, MAX(RequestDate) AS LastDate FROM ServiceRequests;
SELECT Status, COUNT(*) AS RowsPerStatus FROM ServiceRequests GROUP BY Status;
SELECT * FROM ServiceRequests WHERE RequestID IS NULL OR RequestDate IS NULL;

let
    Source = Excel.Workbook(File.Contents("service_requests.xlsx"), null, true),
    Raw = Source{[Item="Raw_Requests",Kind="Table"]}[Data],
    PromoteHeaders = Table.PromoteHeaders(Raw, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"RequestID", Int64.Type},
        {"RequestDate", type date},
        {"HandlingMinutes", Int64.Type}
    }),
    TrimText = Table.TransformColumns(ChangeTypes,{
        {"RequestType", Text.Trim, type text},
        {"Region", Text.Trim, type text},
        {"Status", Text.Trim, type text}
    }),
    StandardiseStatus = Table.ReplaceValue(TrimText,"closed","Closed",Replacer.ReplaceText,{"Status"}),
    RemoveDuplicates = Table.Distinct(StandardiseStatus,{"RequestID"}),
    RemoveBlankIDs = Table.SelectRows(RemoveDuplicates, each [RequestID] <> null)
in
    RemoveBlankIDs

/********************************************************************************************
* @ClassName : UploadFilesController
* @Purpose   : Controller class for uploadFiles lwc  component
* @Author    : Luca Bobbio
* @Date      : 19/02/2023

********************************************************************************************/
public with sharing class UploadFilesController {

    /*
    * @MethodName : createDocRecord
    * @Purpose    : Create a new Document__c record and insert into database
    * @Return     : String 
    * @Parameters : String title, String description, String base64, String filename
    * @Author     : Luca Bobbio
    */ 
    @AuraEnabled
    public static String createDocRecord(String title, String description, String base64, String filename){
        Document__c newDocumentRecord = new Document__c(
            Name = title + ' - ' + System.today().format(),
            Title__c = title,
            Description__c = description
        );
        try {
            if(Schema.SObjectType.Document__c.isAccessible() && Schema.SObjectType.Document__c.isCreateable()){
                Database.SaveResult insertRecordResult = Database.insert(newDocumentRecord, true);
                if(insertRecordResult != null && insertRecordResult.isSuccess()){
                    String response = uploadFile(base64, filename, newDocumentRecord.Id);
                    if(response != null){
                        return String.valueOf(newDocumentRecord.Id);
                    }
                }else{
                    List<Database.Error> errorsList = insertRecordResult.getErrors();
                    for (Database.Error error : errorsList) {
                        System.debug('Error Message => ' + error.getMessage());
                    }
                }
            }    
        } catch (DMLException error) {
            System.debug('Exception DML => ' + error.getMessage());
        }
        return null;
    }

    /*
    * @MethodName : uploadFile
    * @Purpose    : Call methods to create content version and content document link records
    * @Return     : String
    * @Parameters : String base64, String filename, String recordId
    * @Author     : Luca Bobbio
    */ 
    private static String uploadFile(String base64, String filename, String recordId) {
        ContentVersion contentVersionData = createContentVersion(base64, filename);
        ContentDocumentLink contentDocumentLinkData = createContentDocLink(contentVersionData.Id, recordId);
        if (contentVersionData == null || contentDocumentLinkData == null) { return null; }
        return contentDocumentLinkData.Id;
    }

    /*
    * @MethodName : createContentVersion
    * @Purpose    : Create a content version record and insert into database
    * @Return     : ContentVersion object
    * @Parameters : String base64, String filename
    * @Author     : Luca Bobbio
    */ 
    private static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion newContentVersionRecord = new ContentVersion(
            VersionData = EncodingUtil.base64Decode(base64),
            Title = filename,
            PathOnClient = filename
        );
        
        try {
            if(Schema.SObjectType.ContentVersion.isAccessible() && Schema.SObjectType.ContentVersion.isCreateable()){
                Database.SaveResult insertRecordResult = Database.insert(newContentVersionRecord, true);
                if(insertRecordResult == null && !insertRecordResult.isSuccess()){
                    List<Database.Error> errorsList = insertRecordResult.getErrors();
                    for (Database.Error error : errorsList) {
                        System.debug('Error Message => ' + error.getMessage());
                    }
                    return null;
                }
            }
            return newContentVersionRecord;
        } catch (DMLException error) {
            System.debug('Exception DML => ' + error.getMessage());
            return null;
        }
    }

    /*
    * @MethodName : createContentDocLink
    * @Purpose    : Create a content version record and insert into database
    * @Return     : ContentDocumentLink object
    * @Parameters : String contentVersionId, String recordId
    * @Author     : Luca Bobbio
    */ 
    private static ContentDocumentLink createContentDocLink(String contentVersionId, String recordId) {
        if (contentVersionId == null || recordId == null) { 
            return null; 
        }
        
        ContentDocumentLink newContentDocumentLink = new ContentDocumentLink(
            ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: contentVersionId].ContentDocumentId,
            LinkedEntityId = recordId,
            ShareType = 'V'
        );
        
        try {
            if(Schema.SObjectType.ContentDocumentLink.isAccessible() && Schema.SObjectType.ContentDocumentLink.isCreateable()){
                Database.SaveResult insertRecordResult = Database.insert(newContentDocumentLink, true);
                if(insertRecordResult == null  && !insertRecordResult.isSuccess()){
                    List<Database.Error> errorsList = insertRecordResult.getErrors();
                    for (Database.Error error : errorsList) {
                        System.debug('Error Message => ' + error.getMessage());
                    }
                    return null;
                }
            }
            return newContentDocumentLink;
        } catch (DMLException error) {
            System.debug('Exception DML => ' + error.getMessage());
            return null;
        }
    }
}
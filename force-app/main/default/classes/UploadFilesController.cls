public with sharing class UploadFilesController {
    @AuraEnabled
    public static String createDocRecord(String title, String description, String base64, String filename){
        Document__c newDocumentRecord = new Document__c(
            Name = title + ' - ' + System.today().format(),
            Title__c = title,
            Description__c = description
        );
        try {
            insert newDocumentRecord;
        } catch (DMLException error) {
            System.debug('Exception Upload => ' + error.getMessage());
        }
        
        String response = uploadFile(base64, filename, newDocumentRecord.Id);
        return response;
    }

    private static String uploadFile(String base64, String filename, String recordId) {
        ContentVersion contentVersionData = createContentVersion(base64, filename);
        ContentDocumentLink contentDocumentLinkData = createContentLink(contentVersionData.Id, recordId);
        if (contentVersionData == null || contentDocumentLinkData == null) { return null; }
        return contentDocumentLinkData.Id;
    }

    private static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion newContentVersionRecord = new ContentVersion();
        newContentVersionRecord.VersionData = EncodingUtil.base64Decode(base64);
        newContentVersionRecord.Title = filename;
        newContentVersionRecord.PathOnClient = filename;
        try {
            insert newContentVersionRecord;
            return newContentVersionRecord;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }

    private static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        if (contentVersionId == null || recordId == null) { 
            return null; 
        }
        
        ContentDocumentLink newContentDocumentLink = new ContentDocumentLink();
        newContentDocumentLink.ContentDocumentId = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id =: contentVersionId
        ].ContentDocumentId;
        newContentDocumentLink.LinkedEntityId = recordId;
        newContentDocumentLink.ShareType = 'V';
        
        try {
            insert newContentDocumentLink;
            return newContentDocumentLink;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }
}
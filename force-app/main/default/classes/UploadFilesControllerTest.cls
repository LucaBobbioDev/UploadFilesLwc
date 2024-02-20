/********************************************************************************************
* @ClassName : UploadFilesControllerTest
* @Purpose   : Test class for UploadFilesController class
* @Author    : Luca Bobbio
* @Date      : 20/02/2024

********************************************************************************************/
@IsTest
public with sharing class UploadFilesControllerTest {
    /*
    * @MethodName   : successCreateDocRecord
    * @Purpose      : Tests create Document record successful scenario
    * @Return       : void
    * @Parameters   : -
    * @Author       : Luca Bobbio
    */
    @IsTest
    static void successCreateDocRecord() {
        String title = 'Test Document';
        String description = 'Test description';
        String base64 = 'Base64EncodedData';
        String filename = 'test_document.txt';

        Test.startTest();
            String documentId = UploadFilesController.createDocRecord(title, description, base64, filename);
        Test.stopTest();
    
        System.assertNotEquals(null, documentId, 'Document Id should not be null');
    }

    /*
    * @MethodName   : failedCreateDocRecord
    * @Purpose      : Tests create Document record unsuccessful scenario
    * @Return       : void
    * @Parameters   : -
    * @Author       : Luca Bobbio
    */
    @IsTest
    static void failedCreateDocRecord() {
        Test.startTest();
            String documentId = UploadFilesController.createDocRecord(null, null, null, null);
        Test.stopTest();
    
        System.assertEquals(null, documentId, 'Document Id should be null');
    }
}
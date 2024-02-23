import { LightningElement, track } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import createDocRecord from '@salesforce/apex/UploadFilesController.createDocRecord'

const ONE_SECOND_DELAY = 1000;

/**
 * Represents the UploadFiles component responsible for uploading files.
 * @extends {NavigationMixin(LightningElement)}
 */
export default class UploadFiles extends NavigationMixin(LightningElement) {
    @track urlValue;
    @track title = '';
    @track description = '';
    @track showSpinner = false;
    @track previewImage = false;
    @track fieldData = [];

    /**
     * Map containing URL prefixes for different file types.
     * @type {Object}
     */
    @track urlMap = {
        '.pdf': 'data:application/pdf;base64,',
        '.png': 'data:image/png;base64,',
        '.jpg': 'data:image/jpeg;base64,',
        '.jpeg': 'data:image/jpeg;base64,',
        '.xlsx': 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,',
        '.xls': 'data:application/vnd.ms-excel;base64,',
        '.csv': 'data:text/csv;base64,',
        '.doc': 'data:application/msword;base64,',
        '.docx': 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,'
    };

    /**
    * Acceptable file extensions for upload file
    * @returns {Array}  An array of strings of acceptable file extensions
    */
    get acceptedFormats() {
        return [
            '.pdf', 
            '.png', 
            '.jpg',
            '.jpeg',
            '.xlsx',
            '.xls', 
            '.csv',
            '.doc', 
            '.docx'
        ];
    }

    /**
    * Checks if any file in the fieldData has a image extension (png,jpg,jpeg)
    * @returns {boolean} True if at least one file has a image extension, false otherwise 
    */
    get getPreviewImage(){
        return this.fieldData.some(file => /\.(jpg|jpeg|png)$/i.test(file.filename));
    }

    /**
    * Opens the file dialog and processes the selected file
    * @param {Event} event - The file upload event containing the selected file 
    */
    // eslint-disable-next-line consistent-return
    openfileUpload(event){
        const file = event.detail.files[0]
        const acceptedFormats = this.acceptedFormats;
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (acceptedFormats.includes('.' + fileExtension)) {
            // eslint-disable-next-line vars-on-top
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1]
                let fileData = [{
                    'filename': file.name,
                    'base64': base64,
                    'url' : this.urlMap['.' + fileExtension] + base64
                }]
                this.fieldData = fileData
            }
            reader.readAsDataURL(file)
        }else{
            return this.showToast(
                'error', 
                'Erro', 
                'Formato de arquivo não suportado!'
            );
        }
    }

    /**
    * Handle changes from the lightning-input field and assings to title
    * @param {Event} event - The lightning-input event containing the new title value
    */
    handleTitle(event){
        this.title = event.target.value
    }

    /**
    * Handle changes from the lightning-textarea field and assings to description
    * @param {Event} event - The lightning-textarea input event containing the new description value
    */
    handleDescription(event){
        this.description = event.target.value
    }

    /**
    * Sets the previewImage flag to true and updates the urlValue based on clicked element's dataset id 
    * @param {Event} event - The click event triggering the file preview
    */
    handlePreviewFile(event){
        this.previewImage = true;
        this.urlValue = event.currentTarget.dataset.id
    }

    /**
    * Sets the previewImage flag to false, hiding the file preview and closing pop-up
    */
    handleCancel(){
        this.previewImage = false;
    }

    /**
    * Removes the file associated with the clicked element's dataset id from the fieldData array.
    * @param {Event} event - The click event triggering the file deletion
    */
    handleDeleteFile(event){
        const itemToRemove = this.fieldData.find(
            element => element.url === event.currentTarget.dataset.id
        )
        this.fieldData =this.fieldData.filter(function(item) {
            return item !== itemToRemove
        })
    }

    /**
    * Handles the save file action by invoking the onSaveFile method after a short delay
    */
    handleSaveFile(){
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.onSaveFile();
        }, ONE_SECOND_DELAY);
    }

    /**
    * Handles the file saving process by initiating the creation of a new document record with.
    * If the description is not empty and at least one file is selected, it calls the createDocRecord Apex method.
    * If successful, it navigates to the newly created document record page. If unsuccessful, it logs the error 
    * message and displays an error toast.
    */
    onSaveFile(){
        this.showSpinner = true;
        if(this.description && !(this.fieldData.length === 0)){
            const { filename, base64 } = this.fieldData[0]
            createDocRecord({
                title: this.title,
                description: this.description,
                base64: base64,
                filename: filename
            }).then((result) =>{
                if(result == null){
                    this.showSpinner = false;
                    this.showToast('error', 'Erro', 'Algum erro aconteceu');
                    console.log('Unsuccess result =>' + result);
                }else{
                    const recordId = result;
                    console.log('Success result =>' + result);
                    this.showSpinner = false;
                    this.showToast(
                        'success', 
                        'Sucesso', 
                        'Arquivo criado com sucesso!'
                    )
                    this.navigateToDocumentRecordPage(recordId);
                }
            }).catch((error) =>{
                console.error(error);
                this.showToast(
                    'error', 
                    'Erro',     
                    'Ocorreu o seguinte erro ' + JSON.stringify(error) + '.'
                );
                this.showSpinner = false;
            })
        }else{
            this.showToast(
                'warning', 
                'Atenção', 
                'Necessário preencher todos os campos'
            )
            this.showSpinner = false;
        }
    }

    /**
    * Navigates to the record page of a Document__c record with the specified recordId
    * @param {string} recordId - The Id of the Document record to navigate to.
    */
    navigateToDocumentRecordPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Document__c',
                actionName: 'view'
            }
        });
    }

    /**
    * Displays a toast message with the specified type, title, and message.
    * @param {string} type - The type of toast message (error, warning, success).
    * @param {string} title - The title of the toast message.
    * @param {string} message - The content of the toast message.
    */
    showToast(type, title, message) {
        let event = new ShowToastEvent({
            variant: type,
            title: title,
            message: message,
        });
        this.dispatchEvent(event);
    }
}
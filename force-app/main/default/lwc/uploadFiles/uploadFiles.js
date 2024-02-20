import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import createDocRecord from '@salesforce/apex/UploadFilesController.createDocRecord'

export default class UploadFiles extends LightningElement {
    @track urlValue;
    @track title = '';
    @track description = '';
    @track showSpinner = false;
    @track previewImage = false;
    @track fieldData = [];

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

    get getPreviewImage(){
        return this.fieldData.some(file => /\.(jpg|jpeg|png)$/i.test(file.filename));
    }

    openfileUpload(event){
        const file = event.detail.files[0]
        const acceptedFormats = this.acceptedFormats;
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (acceptedFormats.includes('.' + fileExtension)) {
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

    handleTitle(event){
        this.title = event.target.value
    }

    handleDescription(event){
        this.description = event.target.value
    }

    handlePreviewFile(event){
        this.previewImage = true;
        this.urlValue = event.currentTarget.dataset.id
    }

    handleCancel(){
        this.previewImage = false;
    }

    handleDeleteFile(event){
        const itemToRemove = this.fieldData.find(
            element => element.url == event.currentTarget.dataset.id
        )
        this.fieldData =this.fieldData.filter(function(item) {
            return item !== itemToRemove
        })
    }

    handleSaveFile(){
        setTimeout(() => {
            this.onSaveFile();
        }, 100);
    }

    onSaveFile(){
        this.showSpinner = true;
        if(this.description && !(this.fieldData.length == 0)){
            const { filename, base64 } = this.fieldData[0]
            createDocRecord({
                title: this.title,
                description: this.description,
                base64: base64,
                filename: filename
            }).then((result) =>{
                if(result == null){
                    this.showSpinner = false;
                    this.showToast('error', 'Erro', 'Algum erro aconteceu')
                }else{
                    this.showSpinner = false;
                    this.showToast(
                        'success', 
                        'Sucesso', 
                        'Arquivo criado com sucesso!'
                    )
                    window.location.reload()
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

    showToast(type, title, message) {
        let event = new ShowToastEvent({
            variant: type,
            title: title,
            message: message,
        });
        this.dispatchEvent(event);
    }
}
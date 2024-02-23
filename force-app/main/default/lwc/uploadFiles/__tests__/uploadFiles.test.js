import { createElement } from 'lwc';
import UploadFiles from 'c/uploadFiles';

import createDocRecord from '@salesforce/apex/UploadFilesController.createDocRecord'
const mockCreateDocRecord = require('./data/createDocRecord.json');
const mockFieldData = require('./data/fieldData.json');

jest.mock('@salesforce/apex/UploadFilesController.createDocRecord', () => ({
        default:jest.fn(() => Promise.resolve(mockCreateDocRecord))
    }), {virtual:true}
);

describe('c-upload-files', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    test('assign values to title and description', () => {
        const element = createElement('c-upload-files', {
            is: UploadFiles
        });
        document.body.appendChild(element);

        const titleInput = element.shadowRoot.querySelector('lightning-input[data-id="title"]');
        titleInput.value = 'Test Title';
        titleInput.dispatchEvent(new CustomEvent('change'));

        const descriptionInput = element.shadowRoot.querySelector('lightning-textarea[data-id="description"]');
        descriptionInput.value = 'Test Description';
        descriptionInput.dispatchEvent(new CustomEvent('change'));

        return Promise.resolve().then(() => {
            expect(titleInput.value).toBe('Test Title');
            expect(descriptionInput.value).toBe('Test Description');
        });
    });

    test('calls createDocRecord with correct parameters', async () => {
        const expectedParameters = {
            title: 'Test Title',
            description: 'Test Description',
            base64: 'base64data',
            filename: 'test.pdf'
        };
        
        const result = await createDocRecord(expectedParameters);

        expect(createDocRecord).toHaveBeenCalledWith(expectedParameters);
        expect(result).toEqual(mockCreateDocRecord);
    });

    test('handles error when createDocRecord fails', async () => {
        const expectedParameters = {
            title: null,
            description: null,
            base64: null,
            filename: null
        };

        const errorMessage = 'Error creating document record';
        const mockError = new Error(errorMessage);
        createDocRecord.mockRejectedValue(mockError);

        await expect(createDocRecord(expectedParameters)).rejects.toThrow(mockError);
        expect(createDocRecord).toHaveBeenCalledWith(expectedParameters);
    });

    test('assign data for fieldData', async () => {
        const element = createElement('c-upload-files', {
            is: UploadFiles
        });
        document.body.appendChild(element);

        element.fieldData = [
            { filename: 'TestFile1', url: 'testId1' },
            { filename: 'TestFile2', url: 'testId2' },
        ];
        expect(JSON.stringify(element.fieldData)).toContain(JSON.stringify(mockFieldData))
    });
});
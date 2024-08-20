let projectName = "{{projectName}}";
let pathToHashs = '{{pathToHashs}}';

let statusOfTranslatedPage = null;

let counter = 1;


async function getStatusOfTranslatedPage() {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/getStatusOfTranslatedPage`);
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data['status'];
}

let textNodesInSourceLocale = null;

async function getSourcelLocaleOfTextNode() {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}/api/files/${projectName}/hashsWordsSource`);
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
}



getSourcelLocaleOfTextNode().then((response) => {
    textNodesInSourceLocale = response;
    getStatusOfTranslatedPage()
        .then(status => {
            statusOfTranslatedPage = status;
            if (statusOfTranslatedPage === "translateTitle") {
                const modalStyle = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            `;

                const modalDiv = document.createElement('div');
                modalDiv.style.cssText = modalStyle;

                const dialogContainerWidth = '800px';

                const dialogContainerStyle = `
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            width: ${dialogContainerWidth};
        `;

                const dialogContainer = document.createElement('div');
                dialogContainer.style.cssText = dialogContainerStyle;

                const titleOfSourceValue = document.createElement("p");
                titleOfSourceValue.style.fontWeight = '300';
                titleOfSourceValue.style.fontSize = '16px';
                titleOfSourceValue.textContent = "Source value:";
                dialogContainer.appendChild(titleOfSourceValue);

                let span = document.getElementsByTagName("title")[0];
                let spanId = span.id;
                console.log("spanId ", spanId);

                spanId = spanId.split('---')[0];
                const textNodeInSourceLocale = document.createElement("p");
                textNodeInSourceLocale.style.fontWeight = 'normal';
                textNodeInSourceLocale.style.fontSize = '16px';
                textNodeInSourceLocale.textContent = textNodesInSourceLocale[spanId];
                dialogContainer.appendChild(textNodeInSourceLocale);

                const inputStyle = `
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            height: 200px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
        `;

                const input = document.createElement("textarea");
                input.style.cssText = inputStyle;
                input.type = 'text';
                input.value = span.textContent;
                dialogContainer.appendChild(input);

                const buttonsWrapperStyle = `
            margin-top: 10px;
            width: 250px;
            float: right;
            height: 50px;
            display: flex;
            justify-content: flex-end;
        `
                const buttonsWrapper = document.createElement("div");
                buttonsWrapper.style.cssText = buttonsWrapperStyle;
                dialogContainer.appendChild(buttonsWrapper);

                const buttonStyle = `
                padding: 8px 16px;
                margin-top: 10px;
                margin-left: 20px;
                color: #007bff;
                cursor: pointer;
                font-size: 16px;
            `;

                const saveButton = document.createElement('button');
                saveButton.style.cssText = buttonStyle;
                saveButton.textContent = 'Save';

                let statusOfSaveButton = false;
                saveButton.style.color = "gray";
                saveButton.style.cursor = "auto";

                input.addEventListener('input', () => {
                    if (input.value.trim() === '') {
                        statusOfSaveButton = false;
                        saveButton.style.color = "gray";
                        saveButton.style.cursor = "auto";
                    } else if (input.value.trim() === span.textContent.trim()) {
                        statusOfSaveButton = false;
                        saveButton.style.color = "gray";
                        saveButton.style.cursor = "auto";
                    } else {
                        statusOfSaveButton = true;
                        saveButton.style.color = "#007bff";
                        saveButton.style.cursor = "pointer";
                    }
                    console.log('Status changed:', statusOfSaveButton); // Это для проверки
                });

                saveButton.addEventListener('click', function() {
                    if (statusOfSaveButton) {
                        let spanId = span.id;
                        spanId = spanId.split('---')[0];

                        const newText = input.value;

                        const data = {
                            spanId: spanId,
                            newText: newText,
                            pathToHashs: pathToHashs
                        };

                        fetch(`${window.location.protocol}//${window.location.hostname}/api/files/${projectName}/updateHashs`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Error when sending data to the server');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('The data has been successfully sent to the server');
                            })
                            .catch(error => {
                                console.error(error);
                            });

                        try {
                            const response = fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/setStatusOfTranslatedPage`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    status: 'translate'
                                })
                            });
                            window.location.reload();
                        } catch (error) {
                            console.error('Something went wrong when trying to change the status of the translated page', error);
                        }

                        modalDiv.remove();
                        span.textContent = newText;
                    }
                });
                buttonsWrapper.appendChild(saveButton);

                const cancelButton = document.createElement('button');
                cancelButton.style.cssText = buttonStyle;
                cancelButton.textContent = 'Cancel';
                cancelButton.addEventListener('click', async function () {
                    try {
                        const response = await fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/setStatusOfTranslatedPage`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                status: 'translate'
                            })
                        });
                        window.location.reload();
                    } catch (error) {
                        console.error('Something went wrong when trying to change the status of the translated page', error);
                    }
                    modalDiv.remove();
                });
                buttonsWrapper.appendChild(cancelButton);

                modalDiv.appendChild(dialogContainer);

                document.body.appendChild(modalDiv);
            }
        })

});

fetch(`${window.location.protocol}//${window.location.hostname}/api/files/${projectName}/hashsWordsCommon`)
    .then(response => response.json())
    .then(data => {
        const rootElement = document.documentElement;
        parseTextNodesWithData(rootElement, data);
    })
    .catch(error => console.error('Error loading JSON file:', error));

function parseTextNodesWithData(element, data) {
    for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && !isInsideScriptOrStyle(node)) {
            let textContent = node.textContent.trim();
            if (textContent.length > 0) {
                let trimmedText = textContent.trim();
                if (data.hasOwnProperty(trimmedText)) {
                    const spanId = trimmedText + "---" + counter++;
                    if (node.parentNode.nodeName === "TITLE") {
                        node.parentElement.id = spanId;
                        node.parentElement.textContent = data[trimmedText];
                    } else {
                        const span = document.createElement("span");
                        span.id = spanId;
                        span.textContent = data[trimmedText];
                        node.parentNode.replaceChild(span, node);
                        addEventListenerToSpan(span);
                    }
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            parseTextNodesWithData(node, data);
        }
    }
}


function isInsideScriptOrStyle(node) {
    let parent = node.parentNode;
    while (parent !== null) {
        const tagName = parent.tagName ? parent.tagName.toUpperCase() : '';
        if (tagName === 'SCRIPT' || tagName === 'STYLE') {
            return true;
        }
        parent = parent.parentNode;
    }
    return false;
}

function addEventListenerToSpan(span) {
    const link = span.closest('a');
        if (link != null) {
            link.addEventListener("click", function(event) {
                getStatusOfTranslatedPage()
                    .then(status => statusOfTranslatedPage = status);

                if (statusOfTranslatedPage === "translate") {
                    event.preventDefault();
                }
            })
        }

    span.addEventListener("click", function(event) {
        getStatusOfTranslatedPage()
            .then(status => statusOfTranslatedPage = status);

        if (statusOfTranslatedPage === "translate") {
            event.preventDefault();

            const modalStyle = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                `;

            const modalDiv = document.createElement('div');
            modalDiv.style.cssText = modalStyle;

            const dialogContainerWidth = '800px';

            const dialogContainerStyle = `
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                width: ${dialogContainerWidth};
            `;

            const dialogContainer = document.createElement('div');
            dialogContainer.style.cssText = dialogContainerStyle;

            const titleOfSourceValue = document.createElement("p");
            titleOfSourceValue.style.fontWeight = '300';
            titleOfSourceValue.style.fontSize = '16px';
            titleOfSourceValue.textContent = "Source value:";
            dialogContainer.appendChild(titleOfSourceValue);

            let spanId = span.id;

            spanId = spanId.split('---')[0];
            const textNodeInSourceLocale = document.createElement("p");
            textNodeInSourceLocale.style.fontWeight = 'normal';
            textNodeInSourceLocale.style.fontSize = '16px';
            textNodeInSourceLocale.textContent = textNodesInSourceLocale[spanId];
            dialogContainer.appendChild(textNodeInSourceLocale);

            const inputStyle = `
                width: 100%;
                padding: 8px;
                margin-top: 10px;
                height: 200px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
                font-size: 14px;
            `;

            const input = document.createElement("textarea");
            input.style.cssText = inputStyle;
            input.type = 'text';
            input.value = span.textContent;
            dialogContainer.appendChild(input);

            const buttonsWrapperStyle = `
                margin-top: 10px;
                width: 250px;
                float: right;
                height: 50px;
                display: flex;
                justify-content: flex-end;
            `

            const buttonsWrapper = document.createElement("div");
            buttonsWrapper.style.cssText = buttonsWrapperStyle;
            dialogContainer.appendChild(buttonsWrapper);

            const buttonStyle = `
                    padding: 8px 16px;
                    margin-top: 10px;
                    margin-left: 20px;
                    color: #007bff;
                    cursor: pointer;
                    font-size: 16px;
                `;

            const saveButton = document.createElement('button');
            saveButton.style.cssText = buttonStyle;
            saveButton.textContent = 'Save';

            let statusOfSaveButton = false;
            saveButton.style.color = "gray";
            saveButton.style.cursor = "auto";

            input.addEventListener('input', () => {
                if (input.value.trim() === '') {
                    statusOfSaveButton = false;
                    saveButton.style.color = "gray";
                    saveButton.style.cursor = "auto";
                } else if (input.value.trim() === span.textContent.trim()) {
                    statusOfSaveButton = false;
                    saveButton.style.color = "gray";
                    saveButton.style.cursor = "auto";
                } else {
                    statusOfSaveButton = true;
                    saveButton.style.color = "#007bff";
                    saveButton.style.cursor = "pointer";
                }
            });

            saveButton.addEventListener('click', function() {
                if (statusOfSaveButton) {
                    let spanId = span.id;
                    spanId = spanId.split('---')[0];

                    const newText = input.value;

                    const data = {
                        spanId: spanId,
                        newText: newText,
                        pathToHashs: pathToHashs
                    };

                    fetch(`${window.location.protocol}//${window.location.hostname}/api/files/${projectName}/updateHashs`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error when sending data to the server');
                            }
                            return response.json();
                        }).catch(error => {
                            console.error(error);
                        });

                    modalDiv.remove();
                    span.textContent = newText;
                }
            });
            buttonsWrapper.appendChild(saveButton);

            const cancelButton = document.createElement('button');
            cancelButton.style.cssText = buttonStyle;
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', function() {
                modalDiv.remove();
            });
            buttonsWrapper.appendChild(cancelButton);

            modalDiv.appendChild(dialogContainer);

            document.body.appendChild(modalDiv);

        }
    });

    span.addEventListener('mouseover', function() {
        getStatusOfTranslatedPage()
            .then(status => statusOfTranslatedPage = status);

        if (statusOfTranslatedPage === "translate") {
            span.style.color = 'orange';
            span.style.cursor = 'pointer';
        }
    });

    span.addEventListener('mouseout', function() {
        getStatusOfTranslatedPage()
            .then(status => statusOfTranslatedPage = status);

        if (statusOfTranslatedPage === "translate") {
            span.style.color = '';
        }
    });
}


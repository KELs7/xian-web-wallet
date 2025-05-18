async function acceptRequest() {
    let message = document.getElementById('requestSignatureMessage').innerHTML;
    
    try {
        // Check if the wallet is locked, assuming 'locked' is a global variable
        if (locked) {
            toast('danger', 'Wallet is locked. Cannot sign message.');
            // Send error back to opener, consistent with how multi-account might handle rejections/errors
            window.opener.postMessage({type: 'REQUEST_SIGNATURE', data: {signature: null, errors: ['Wallet is locked']}, callbackKey: callbackKey}, '*');
            window.close();
            return;
        }

        let signedMsg = await signMessage(message, unencryptedMnemonic, selectedAccountVk); 
        
        window.opener.postMessage({type: 'REQUEST_SIGNATURE', data: {signature: signedMsg}, callbackKey: callbackKey}, '*');
        toast('success', 'Successfully signed message');
        window.close();
        
    }
    catch (error) {
        console.log(error);
        toast('danger', 'Error signing message: ' + error.message); // Show specific error message
        // Send error back to opener
        window.opener.postMessage({type: 'REQUEST_SIGNATURE', data: {signature: null, errors: [error.message]}, callbackKey: callbackKey}, '*');
        window.close();
    }
    
}

function rejectRequest() {
    window.opener.postMessage({type: 'REQUEST_SIGNATURE', data: {signature: null}, callbackKey: callbackKey}, '*');
    toast('warning', 'Request rejected');
    window.close();
}

// We need to also catch the case where the user closes the window
window.onbeforeunload = function() {
    rejectRequest();
};


document.getElementById('request-signature-accept').addEventListener('click', function() {
    acceptRequest();
});

document.getElementById('request-signature-reject').addEventListener('click', function() {
    rejectRequest();
});
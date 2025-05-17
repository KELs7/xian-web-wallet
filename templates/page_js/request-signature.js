async function acceptRequest() {
    let message = document.getElementById('requestSignatureMessage').innerHTML;
    
    try {
        // Check if the wallet is locked, assuming 'locked' is a global variable
        // populated by the multi-account version of external.js
        if (locked) {
            toast('danger', 'Wallet is locked. Cannot sign message.');
            // Send error back to opener, consistent with how multi-account might handle rejections/errors
            window.opener.postMessage({type: 'REQUEST_SIGNATURE', data: {signature: null, errors: ['Wallet is locked']}, callbackKey: callbackKey}, '*');
            window.close();
            return;
        }

        // Call the multi-account version of signMessage.
        // Assumes 'unencryptedMnemonic' and 'selectedAccountVk' are global variables
        // populated by the multi-account version of external.js.
        // The signMessage function from multi-account xian.js will internally handle
        // whether the account is derived (using mnemonic and index from accounts array)
        // or imported (using unencryptedImportedSks).
        let signedMsg = await signMessage(message, unencryptedMnemonic, selectedAccountVk); 
        
        window.opener.postMessage({type: 'REQUEST_SIGNATURE', data: {signature: signedMsg}, callbackKey: callbackKey}, '*');
        toast('success', 'Successfully signed message');
        window.close();
        
    }
    catch (error) {
        console.log(error); // Log the error for debugging
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
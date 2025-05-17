async function acceptRequest() {
    // Reads contract name from the DOM element, which is populated by js/external.js (main branch version)
    // js/external.js (main branch) would need to use the multi-account getTokenInfo to populate these initially.
    let contract = document.getElementById('requestTokenMessage').innerHTML; 
    
    // only allow alphanumeric characters and underscores (validation from main branch)
    if (!/^[a-zA-Z0-9_]*$/.test(contract)) {
        toast('danger', 'Invalid contract name!');
        // Uses main branch's postMessage structure for failure
        window.opener.postMessage({type: 'REQUEST_TOKEN', data: {success: false}, callbackKey: callbackKey}, '*');
        return;
    }

    // ASSUMPTION: The `getTokenInfo` function available in this scope is the
    // "redefined" one from the multi-account branch's js/xian.js.
    let token_info = await getTokenInfo(contract); 

    // Check for error marker from multi-account getTokenInfo
    if (token_info.name === "\x9Eée" || token_info.symbol === "\x9Eée") {
        toast('danger', 'Token does not exist or is not a valid token contract.');
        window.opener.postMessage({type: 'REQUEST_TOKEN', data: {success: false}, callbackKey: callbackKey}, '*');
        return;
    }
    // Check for incomplete metadata (e.g., contract exists but not a standard token)
    // Multi-account getTokenInfo might return 'Unknown Name' or '???' or null for missing parts.
    // The original main branch checked for `undefined`. We adapt this to be more robust.
    if ((token_info.name === null || token_info.name === 'Unknown Name' || token_info.symbol === null || token_info.symbol === '???') && contract !== 'currency') {
        toast('danger', 'Error retrieving full token info. Contract might not be a standard token.');
        window.opener.postMessage({type: 'REQUEST_TOKEN', data: {success: false}, callbackKey: callbackKey}, '*');
        return;
    }

    try {
        // This block for managing token_list and localStorage is from the main branch version of this file.
        let token_list = JSON.parse(localStorage.getItem("token_list")) || ["currency"];
        if (!token_list.includes(contract)) {
            token_list.push(contract);
            localStorage.setItem("token_list", JSON.stringify(token_list));
        }
        // Main branch's postMessage structure for success
        window.opener.postMessage({type: 'REQUEST_TOKEN', data: {success: true}, callbackKey: callbackKey}, '*');
        toast('success', 'Successfully added token');
        window.close();
        
    }
    catch (error) {
        console.log(error);
        toast('danger', 'Error adding token: ' + error.message); // Show error.message
        window.close();
    }
    
}

function rejectRequest() {
    // Main branch's postMessage structure
    window.opener.postMessage({type: 'REQUEST_TOKEN', data: {success: false}, callbackKey: callbackKey}, '*');
    toast('warning', 'Request rejected');
    window.close();
}

// We need to also catch the case where the user closes the window
window.onbeforeunload = function() {
    // The main branch directly calls rejectRequest.
    // The multi-account version of this file uses an `isActionTaken` flag.
    // Sticking to the main branch's file structure here.
    rejectRequest();
};


document.getElementById('request-token-accept').addEventListener('click', function() {
    acceptRequest();
});

document.getElementById('request-token-reject').addEventListener('click', function() {
    rejectRequest();
});
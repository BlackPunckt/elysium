// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

$w.onReady(function () {

    // Write your Javascript code here using the Velo framework API

    // Print hello world:
    // console.log("Hello world!");

    // Call functions on page elements, e.g.:
    // $w("#button1").label = "Click me!";

    // Click "Run", or Preview your site, to execute your code

});

$w('#statusButton').onClick((event) => {

    if ($w('#statusBox').isVisible) {
        $w('#statusBox').hide(); // Puedes usar "fade", "slide", etc.
    } else {
        $w('#statusBox').show();
        $w('#assignmentBox').hide();
        $w('#editBox').hide();
    }

})

$w('#asignmentButton').onClick((event) => {

    if ($w('#assignmentBox').isVisible) {
        $w('#assignmentBox').hide(); // Puedes usar "fade", "slide", etc.
    } else {
        $w('#assignmentBox').show();
        $w('#statusBox').hide();
        $w('#editBox').hide();
    }

})

$w('#editButton').onClick((event) => {
    if ($w('#editBox').isVisible) {
        $w('#editBox').hide(); // Puedes usar "fade", "slide", etc.
    } else {
        $w('#editBox').show();
        $w('#statusBox').hide();
        $w('#assignmentBox').hide();

    }
})

$w('#statusBox').onMouseOut((event) => {
    $w('#statusBox').hide();
})

$w('#assignmentBox').onMouseOut((event) => {
    $w('#assignmentBox').hide();
})

$w('#editBox').onMouseOut((event) => {
    $w('#editBox').hide();
})



$w('#privateDesctiptionButtonOpen').onClick((event) => {

    $w("#privateDescriptionMultiStateBox").changeState("Open");    

})



$w('#cancelPrivateDescriptionButton').onClick((event) => {
    
	$w("#privateDescriptionText").value = " ";
	$w("#privateDescriptionMultiStateBox").changeState("Close");

})

$w('#button19').onClick((event) => {

    $w("#addTagsMultiStateBox").changeState("open");    
	
})

$w('#cancelTagsButton').onClick((event) => {
	$w("#tagsText").value = " ";
    $w("#addTagsMultiStateBox").changeState("close");      
})
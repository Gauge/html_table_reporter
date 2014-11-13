var showHide = function(id,pid) { 
	var element = $("."+id); 
	var pelement = $("."+pid); 
	if (pelement.css("display") == "none") { 
		element.toggle(false); 
		element.click(); 
	} else { 
		element.toggle(); 
		if (element.css("display") == "none") {
			element.click();
		}
	}
}


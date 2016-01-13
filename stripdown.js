// stripdown.js v1.0.0 | github.com/chbk/stripdown.js
;(function(){
	
	var regex = {
		newline: /^( *\n)+/,
		pre: /^(?: {4,}\S[^\n]*(?:\n(?! *\n)[^\n]*)*(?: *\n)*)+/,
		blockquote: /^(?: *> *\S[^\n]*(?:\n(?! *\n)[^\n]*)*(?: *\n)*)+/,
		numlist: /^(?: *\d+\. [^\n]*(?:\n(?:(?: *\n)* )?(?! *\n)[^\n]*)*(?: *\n)*)+/,
		abclist: /^(?: *[a-z]\. [^\n]*(?:\n(?:(?: *\n)* )?(?! *\n)[^\n]*)*(?: *\n)*)+/,
		dashlist: /^(?: *- [^\n]*(?:\n(?:(?: *\n)* )?(?! *\n)[^\n]*)*(?: *\n)*)+/,
		numitem: /^( ?)( ?)( ?)\d+\. [^\n]*(?:\n(?!\1?\2?\3?\d+\. )[^\n]*)*/gm,
		abcitem: /^( ?)( ?)( ?)[a-z]\. [^\n]*(?:\n(?!\1?\2?\3?[a-z]\. )[^\n]*)*/gm,
		dashitem: /^( ?)( ?)( ?)- [^\n]*(?:\n(?!\1?\2?\3?- )[^\n]*)*/gm,
		paragraph: /^ *\S[^\n]*(?:\n(?! *(?:\n|> *\S|- |\d+\. |[a-z]\. )| {4})[^\n]*)*/,
		raw: /^[^\n]*/,
		escape: /^\\([\\\[\-.`_>])/,
		autolink: /^(https?:\/\/([^\s<]+[^<.,:;"')\]\s]))/,
		link: /^\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\((\b|https?:\/{2})((?:[a-z0-9.\-]{2,})(?:\/\S*)?)\)/i,
		strong: /^__ *(?=\S)((?:[^\\_]|\\[\\_]|\\(?![\\_])|_ *(?=\S)(?:[^\\_]|\\[\\_]|\\(?![\\_]))+_)+)__/,
		em: /^_ *(?=\S)((?:[^\\_]|\\[\\_]|\\(?![\\_])|__ *(?=\S)(?:[^\\_]|\\[\\_]|\\(?![\\_]))+__)+)_/,
		code: /^`(?!`)((?:\\\\)*|[\s\S]*?(?:[^\\](?:\\\\)*|[^`\\]))`/,
		br: /^ *\n */,
		text: /^[\s\S]+?(?=\\[\\\[\-.`_>]|[\[`_]|https?:\/\/| *(?:\n|$))/
	};
	
	// Parse input into HTML
	function parse(src) {
		
		src = trim(String(src));
		
		var out = '', cap, html, start;
		
		while (src) {
			
			// Newline
			if (cap = regex.newline.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				continue;
			}
			
			// Preformated
			if (cap = regex.pre.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				cap = cap[0].replace(/^ {0,4}/gm, '').replace(/ *(\n *)*$/, '');
				
				html = htmlEncode(cap);
				
				out += '<pre>'+html+'</pre>';
				
				continue;
			}
			
			// Blockquote
			if (cap = regex.blockquote.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				cap = cap[0].replace(/^ *>/gm, '');
				
				html = parse(cap);
				
				out += '<blockquote>'+html+'</blockquote>';
				
				continue;
			}
			
			// NumList
			if (cap = regex.numlist.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				start = /^ *(\d+)\. /.exec(cap[0])[1];
				
				out += '<ol'+(start > 1 ? ' start="'+start+'"' : '')+'>';
				
				out += items(cap[0], 'numitem');
				
				out += '</ol>';
				
				continue;
			}
			
			// AbcList
			if (cap = regex.abclist.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				start = /^ *([a-z])\. /.exec(cap[0])[1].toLowerCase().charCodeAt(0) - 96;
				
				out += '<ol type="a"'+(start > 1 ? ' start="'+start+'"' : '')+'>';
				
				out += items(cap[0], 'abcitem');
				
				out += '</ol>';
				
				continue;
			}
			
			// DashList
			if (cap = regex.dashlist.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				out += '<ul>';
				
				out += items(cap[0], 'dashitem');
				
				out += '</ul>';
			
				continue;
			}
			
			// Paragraph
			if (cap = regex.paragraph.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				cap = cap[0].replace(/^ */, '').replace(/ *(\n *)*$/, '');
				
				html = inline(cap);
				
				out += '<p>'+html+'</p>';
				
				continue;
			}
			
			// Raw
			if (cap = regex.raw.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				cap = cap[0].replace(/^ */, '').replace(/ *(\n *)*$/, '');
				
				html = inline(cap);
				
				out += html;
				
				continue;
			}
			
			if (src) throw new Error('Infinite block loop on byte: '+src.charCodeAt(0));
		}
		
		return out;
	}
	
	// Parse list items
	function items(src, type) {
		
		var out = '', item, space, html;
		
		// Get each top-level item
		src = src.match(regex[type]);
		
		for (var i = 0; i < src.length; i++) {
			
			item = src[i];
			
			// Remove indents
			item = item.replace(/^ {0,4}/gm, '').replace(/^ *(-|\d+\.|[a-z]\.) /, '');
			
			html = parse(item);
			
			out += '<li>'+html+'</li>';
		}
		
		return out;
	}
	
	// Parse inline content
	function inline(src) {
		
		var out = '', cap, html, href, title;
		
		while (src) {
			
			// Escape
			if (cap = regex.escape.exec(src)){
				
				src = src.substring(cap[0].length);
				
				out += htmlEncode(cap[1]);
				
				continue;
			}
			
			// Link
			if (cap = regex.link.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				href = cap[2] || 'http://';
				
				href += cap[3].replace(/&/g, '&amp;').replace(/"/g, '&quot;');
				
				title = htmlEncode(cap[1].replace(/ {2,}/g, ' '));
				
				out += '<a href="'+href+'">'+title+'</a>';
				
				continue;
			}
			
			// Autolink
			if (cap = regex.autolink.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				href = cap[1].replace(/&/g, '&amp;').replace(/"/g, '&quot;');
				
				title = htmlEncode(cap[2]);
				
				out += '<a href="'+href+'">'+title+'</a>';
				
				continue;
			}
			
			// Strong
			if (cap = regex.strong.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				html = inline(cap[1].replace(/[\n ]+$/, ''));
				
				out += '<strong>'+html+'</strong>';
				
				continue;
			}
			
			// Em
			if (cap = regex.em.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				html = inline(cap[1].replace(/[\n ]+$/, ''));
				
				out += '<em>'+html+'</em>';
				
				continue;
			}
			
			// Code
			if (cap = regex.code.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				html = htmlEncode(cap[1].replace(/\\([\\`])/g, '$1'));
				
				out += '<code>'+html+'</code>';
				
				continue;
			}
			
			// Br
			if (cap = regex.br.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				out += '<br/>';
				
				continue;
			}
			
			// Text
			if (cap = regex.text.exec(src)) {
				
				src = src.substring(cap[0].length);
				
				html = htmlEncode(cap[0].replace(/ {2,}/g, ' '));
				
				out += html;
				
				continue;
			}
			
			if (src) throw new Error('Infinite inline loop on byte: ' + src.charCodeAt(0));
		}
		
		return out;
	}
	
	function htmlEncode(str) {
		
		return str.replace(/&/g, '&amp;')
				  .replace(/</g, '&lt;')
				  .replace(/>/g, '&gt;')
				  .replace(/"/g, '&quot;')
				  .replace(/'/g, '&#x27;')
				  .replace(/\//g, '&#x2F;');
	}
	
	function trim(str) {
		
		return str.replace(/\t/g, '    ')  // tabulation
				  .replace(/\u00a0/g, ' ') // non-breaking space
				  .replace(/\u3000/g, ' ') // full-width space
				  .replace(/\r/g, '\n')    // carriage return
				  .replace(/\f/g, '\n')    // form feed
	}
	
	// Node.js exported module
	if (typeof module === 'object' && module.exports) module.exports = parse;
	
	// Globals
	else this.stripdown = parse;
	
})();

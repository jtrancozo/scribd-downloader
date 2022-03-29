// ==UserScript==
// @name         Scribd Book Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       You
// @match        https://*.scribd.com/*
// @icon         https://www.google.com/s2/favicons?domain=scribd.com
// @grant        none
// ==/UserScript==

(function() {
    let bookName = document.title;

    let url = document.location.href;

    const styles = "#app-wrapper { position: fixed; bottom: 10px; left: 10px; z-index: 9999; }"+
          "#app-wrapper .btn-app {display: inline-block; padding: 10px 20px; margin-right: 15px; background: #fd4343; color: #fff; font-size: 14px; font-weight: bold; border-radius: 5px; display:none; }";

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // btn wrapper
    const wrapper = document.createElement('DIV');
    wrapper.id = 'app-wrapper';
    document.body.appendChild(wrapper);

    // Btn Download
    const btn = document.createElement('A');
    btn.innerText = 'Download Content';
    btn.id = 'btn-download';
    btn.className = 'btn btn-app';
    btn.href = "javascript:;"
    wrapper.appendChild(btn);

    const btn_print = document.createElement('A');
    btn_print.innerText = 'Print';
    btn_print.id = 'btn-print';
    btn_print.className = 'btn-app';
    btn_print.href = "javascript:;"
    wrapper.appendChild(btn_print);

    // Book
    const book = document.createElement('DIV');
    book.id = 'book';
    document.body.appendChild(book);


    // Next Page Arrow
    const next = document.querySelector('.page_right.next_btn');

    function createBook () {
        const book_w = document.querySelector('#column_container .reader_column.left_column > div').style.width;
        const book_h = document.querySelector('#column_container .reader_column.left_column > div').style.height;

        // const book_w = 585;
        // const book_h = 765;

        let css = "<head><style>"+
            `#book .reader_column.left_column, #book .reader_column.right_column {position: relative; width: ${book_w}; height: auto; overflow: hidden } `+
            "#book :not(table div) { display: inline-block !important } #book * { position: static !important; transform: none !important; padding-left: 0 !important; padding-right: 0 !important }"+
            "#book .reader_column > div {height: auto !important} " +
            "#book .text_line > span { margin-right: 4px; }"+
            "style {color: #fff; display: none; opacity: 0;}"+
            "@media print { style {color: #fff; display: none; opacity: 0;} #book .text_line > span { margin-right: 4px; } }" +
            "</style></head>";

        book.style.cssText = `width: ${book_w}px; height: auto;`;
        book.innerHTML = css;
    }


    const initBookScrapper = function () {
        createBook();

        let pages = getPageCounter();
        // let pageBefore = 1;

        function loop () {
            // pageBefore = pages.atual;

            setTimeout(() => {
                clonePageContent();
                next.click();

                pages = getPageCounter();

                if (pages.atual < pages.total) {
                // if (pages.atual < 20) {
                    loop();
                } else {
                    // fixColumnsHeight();
                }

                // console.log(pages.atual);

            }, 2000);
        }

        loop();


    }

    const clonePageContent = function () {
        convertImages();

        let pageLeft = document.querySelector('#column_container .reader_column.left_column');
        let pageRight = document.querySelector('#column_container .reader_column.right_column');

        book.append(pageLeft.cloneNode(true));
        book.append(pageRight.cloneNode(true));
    }

    const convertImages = function () {
        let imgs = document.querySelectorAll('#column_container img');

        for (let img of imgs) {
            if (img.naturalWidth == 1 && img.naturalHeight == 1) {
                img.style.display = 'none !important';
                img.remove();
            }

            const newImg = getBase64Image(img);

            img.src = newImg;
        }
    }

    const nextPage = function () {

    }

    const getPageCounter = () => {
        let text = document.querySelector('.page_counter').innerText;

        text = text.split(' ');

        return {
            atual: parseInt(text[1]),
            total: parseInt(text[3])
        }
    }

    const getBase64Image = function (img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/jpeg", 1);
        // return '<img src="'+dataURL+'">';
        return dataURL;
    }

    const fixColumnsHeight = function () {
        let columns = document.querySelectorAll('#book .reader_column');

        for (let column of columns) {
            let contents = column.querySelector('div').querySelectorAll('div > *');
            let height = 0;

            for (let content of contents) {
                height+= content.clientHeight;
            }

            column.style.height = height+'px';
        }
    }

    const getPDFUrl = function (mobile) {
        // return location.href.replace(/^.*?(\d+).*$/, "https://www.scribd.com/document_downloads/$1?extension=pdf&source=mobile_download");
        let mobileTag = mobile ? "&source=mobile_download" : "/";
        return location.href.replace(/^.*?(\d+).*$/, "https://www.scribd.com/document_downloads/$1?extension=pdf" + mobileTag);
    }

    const print = () => {
        var divContents = document.querySelector('#book').outerHTML;
        let fonts = document.querySelector('#fontfaces').outerHTML;

        var printWindow = window.open('/', 'Livro', 'height=585,width=1015');
        printWindow.document.write('<html><head><title>'+ bookName +'</title>');
        printWindow.document.write(fonts);

        printWindow.document.write('<link href="https://s-f.scribdassets.com/webpack/monolith/books.53ebd7db38ffe4c98aa2.css"/>');

        printWindow.document.write('</head><body><div class="auto__books_epub_book_view">');
        printWindow.document.write(divContents);
        printWindow.document.write('</div></body></html>');
        // printWindow.document.close();
        // printWindow.print();
    }


    const downloadDocument = function () {
        if (/document/.test(url)) {
            let link = getPDFUrl();
            btn.innerText = "Download as PDF";
            btn.style.display = "inline-block";
            btn.href = link;
            btn.download = "Book.pdf";
            // btn.target = "_blank";

            // Btn Download
            const btnMobile = document.createElement('A');
            btnMobile.innerText = 'Download as PDF Mobile';
            btnMobile.id = 'btn-download-mobile';
            btnMobile.className = 'btn btn-app';
            btnMobile.style.display = "inline-block";
            btnMobile.href = getPDFUrl('mobile');
            wrapper.appendChild(btnMobile);

            console.log(btnMobile);
        }
    }

    const downloadEbook = function () {
        if (/read/.test(url)) {
            btn.innerText = "Get Content";
            btn.style.display = "inline-block";
            btn.addEventListener('click', () => initBookScrapper());

            btn_print.style.display = "inline-block";
            btn_print.addEventListener('click', () => print());
        }
    }


    switch (true) {
        case /document/.test(url):
            downloadDocument();
            break;
        case /read/.test(url):
            downloadEbook();
            break;
        case /listen/.test(url):
            downloadAudio();
            break;
        default:
            console.log();
    }

})();

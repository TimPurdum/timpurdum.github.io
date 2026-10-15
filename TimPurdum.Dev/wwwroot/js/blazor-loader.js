// Starts the Blazor WebAssembly runtime only on pages that need it, and only when the reader asks.
//
// Why: Blazor runs .NET on the browser's main thread, and GeoBlazor Pro's service registration
// (AddGeoBlazorPro) takes 20+ seconds in the WebAssembly interpreter. While it runs, the whole page
// is frozen: no scrolling, no clicks, no other scripts. Booting Blazor on every page load froze even
// text-only posts that have nothing interactive to show.
//
// Every interactive placeholder the Compiler emits carries class="component-block". Pages without
// one never download the runtime. Pages with one show a button in each placeholder; clicking any of
// them loads the runtime, which mounts every component on the page.
//
// 404.html does not use this file; it boots Blazor itself for the NotFoundRedirect component.
(function () {
    var placeholders = document.querySelectorAll(".component-block");
    if (placeholders.length === 0) {
        return;
    }

    var started = false;

    function startBlazor() {
        if (started) {
            return;
        }
        started = true;

        placeholders.forEach(function (placeholder) {
            placeholder.classList.remove("component-block-idle");
            var button = placeholder.querySelector(".component-load-button");
            if (button) {
                button.remove();
            }
        });

        var script = document.createElement("script");
        script.src = "_framework/blazor.webassembly.js";
        document.body.appendChild(script);
    }

    placeholders.forEach(function (placeholder) {
        placeholder.classList.add("component-block-idle");

        var button = document.createElement("button");
        button.type = "button";
        button.className = "component-load-button";
        button.textContent = "Load interactive map";
        button.addEventListener("click", startBlazor);
        placeholder.appendChild(button);
    });
})();

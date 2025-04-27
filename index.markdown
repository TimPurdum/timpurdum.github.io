---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
# Home

Tim Purdum is the visionary behind the <a target="_blank" href="https://www.geoblazor.com">
    <img style="display: inline;" width="16" src="/assets/geoblazor.png">GeoBlazor</a> open-source library and currently serves as the Director of Product Development at <a target="_blank" href="https://www.dymaptic.com">
            <img style="display: inline;" width="16" src="https://www.dymaptic.com/wp-content/uploads/2021/02/dymaptic-smaller.png" alt="dymaptic logo" />dymaptic</a>. With a robust background in .NET and web technologies, Tim has been a dedicated Software Engineer in the GIS field since 2021. His expertise and passion for technology have made him a sought-after speaker at numerous conferences, including VS Live, TechBash, Iowa Code Camp, and DevUp.

<div id="social-col">
    <div id="bsky-section">
        <div id="bsky-header">
            <img alt="Bluesky" style="width: 16rem;" src="images/bsky.webp">
        </div>
        <div id="bsky-feed">
            <bsky-embed
                username="timpurdum.dev"
                mode="dark"
                limit="10"
                link-target="_blank"
                link-image="true"
                load-more="true"
                disable-styles="false"
                custom-styles=".border-slate-300 { border-color: #1185fe; } article > .flex.gap-2 { flex-direction: column; overflow: hidden } article > div > div > div.items-center { flex-direction: column; align-items: start; }"
                date-format='{"type":"absolute","options":{"year":"2-digit","month":"short","day":"numeric","hour":"numeric", "minute":"numeric"}}'>
            </bsky-embed>
        </div>
  </div>
    <div id="mastodon-section">
        <div id="mastodon-header">
            <img alt="Mastodon" style="width: 16rem;" src="images/mastodon-header.png">
         </div>
        <div id="mastodon"></div>
    </div>
</div>

<script src="main.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/npm/bsky-embed/dist/bsky-embed.es.js" async></script>
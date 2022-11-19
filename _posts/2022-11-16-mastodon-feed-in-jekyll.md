---
layout: post
title: "Adding a Mastodon Feed to your Blog"
---

While I was [setting up my new Jekyll static blog site](2022-11-07-static-site-width-jekyll), I have also been investigating the rapidly growing world of [Mastodon](https://joinmastodon.org/) and the [Fediverse](https://www.fediverse.to/). I wanted to bring the two worlds together, and share a bit of my Mastodon feed on my website. So I threw together a JavaScript function to import and display my feed. This is made possible by the fact that every Mastodon feed is also an [RSS](https://en.wikipedia.org/wiki/RSS) feed. For example, if you go to https://fosstodon.org/@TimPurdum.rss, you will see my feed as RSS XML.

Grabbing this feed in modern JavaScript is a breeze with `fetch`.

```javascript
fetch(rss_url)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
        console.log(data);
    };
```

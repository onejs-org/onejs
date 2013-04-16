---
layout: index
---

OneJS is a command-line utility for converting CommonJS packages to single, stand-alone JavaScript
files that can be run on web browsers.

<iframe src="http://ghbtns.com/github-btn.html?user=azer&repo=onejs&type=fork"
  allowtransparency="true" frameborder="0" scrolling="0" width="62" height="20"></iframe>

{% highlight javascript %}
one('./package.json')
    .filter(/^build\.js$/)
    .filter(/^bundle\.js$/)
    .save('bundle.js');
{% endhighlight %}

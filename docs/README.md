# Auto-slideshow

For communicating written information using a simple slideshow, automatically read aloud to the recipient. Particularly designed for recipients with learning disabilities or who find it hard to read.

Currently a prototype for demonstration with limited features, particularly adding new images.

[Demonstration site](https://mullpointer.github.io/auto-slideshow/) available here.
Text is read out using text-to-speech built into modern web browsers. This may not be available on some devices, particularly older mobile phones.

Inspired by the work of [Dr Howard Leicester](https://www.accessible-info.co.uk/).


# Using

Add text and images using the editor. Then generate a link using the "Make Shareable Link" item from the menu in the top right.

![Make shareable link top of the list in the main menu](makeshareable.png)

Copy the link to your recipient through an electronic message or make it into a [QR code](https://www.nayuki.io/page/qr-code-generator-library#live-demo-javascript).



# Installing on your own server

The demonstration requires only a static HTML server. Simply add the files from the [latest release](https://github.com/mullpointer/auto-slideshow/releases) to your server.


# Development

Set up for building using [Vite](https://vitejs.dev/).


# Planned features
* Basic user accounts to allow image upload and shorter message links
* Built in QR-code creation
* Text-to-speech using online services to support a wider range of devices for recipients


# OneLine Room Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/github/v/release/lop1505/RoomCard)](https://github.com/lop1505/RoomCard/releases)

A clean, performant, and fully visually configurable room card for Home Assistant.
Developed with a focus on stability, simple design, and maximum flexibility.

![Preview](preview.png)

## ✨ Features

* 🖱️ **Full Visual Editor:** No YAML required (but possible).
* 📏 **Flexible 60-Grid:** Buttons can take up 1/3, 1/4, 1/5, etc. of the width – perfect for any row layout.
* ↕️ **Custom Height:** Make important buttons larger and less important ones smaller.
* 🔋 **Smart Status Chips:** Automatically shows open windows and low batteries (Binary & %).
* ⚡ **Performance:** Vanilla JS, no external dependencies, loads extremely fast.
* 🖱️ **Sortable:** Easily move buttons using arrow keys in the editor.

## 📥 Installation

### Via HACS (Recommended)
1. Open HACS -> Frontend.
2. Click the menu (three dots) in the top right corner -> **Custom repositories**.
3. Paste the URL of this repository.
4. Select category **Lovelace**.
5. Click "Add" and then "Install".

### Manual Installation
1. Download the `room-card.js` file from the latest release.
2. Copy it to your `/config/www/` folder.
3. Add the resource to your Dashboard configuration:
   - URL: `/local/room-card.js`
   - Type: JavaScript Module

## ⚙️ Configuration

Simply add the card via "Add Card" in your dashboard and select **"OneLine Room Card"**.
The visual editor guides you through all settings:

* **General:** Name, Icon, Image, and Colors.
* **Sensors:** Select your temperature, humidity, window, and battery sensors.
* **Buttons:** Add devices and define their width and height individually.

---

## ☕ Support

Do you like my work? I develop this card in my free time. I would be very happy about a coffee!

<a href="https://www.buymeacoffee.com/oneline1505" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---
*Developed by OneLine*
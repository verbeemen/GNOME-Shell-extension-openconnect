# VPN - OpenConnect

# Install
store the project into `/home/<username>/.local/share/gnome-shell/extensions/vpn@openconnect.com`


Essential folder structure:
```
 - vpn@openconnect.com
    - img
     - icon_connected.svg
     - icon_disconnected.svg
    - extension.js
    - metadata.json
    - stylesheet.css
```

# VPN Connector Extension for Gnome
This extension adds a button to the taskbar in Gnome that allows the user to easily connect to and disconnect from a VPN.

# Prerequisites
 1. A script that establishes the VPN connection (e.g. "my_vpn_connector.sh")
 1. Add the script to the sudoers file to avoid being prompted for a password when executing it
 1. Add the command to kill the openconnect process to the sudoers file to avoid being prompted for a password when executing it

# Installation
 1. Download the extension files to your local machine
 1. In Gnome, go to the Extensions tab in the Settings app
 1. Enable "Developer mode"
 1. Click the "Load unpacked" button and select the directory where you downloaded the extension files
 1. The extension should now be installed and active in Gnome

# Debugging
To debug the extension, open a terminal and run the following command:
```shell
journalctl -f -o cat /usr/bin/gnome-shell
```
# Troubleshooting
If you encounter any issues with the extension, make sure that you have properly added the necessary scripts to the sudoers file as described in the Prerequisites section. Additionally, try restarting Gnome or your machine to see if that resolves the issue.
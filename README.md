# GrapheneMessenger Desktop

GrapheneMessenger Desktop is a private messenger for your computer. You can chat,
call, and share files. All messages are end-to-end encrypted.

It works on Windows, macOS, and Linux. It links with the GrapheneMessenger app on
your phone.

- Mobile app: [GrapheneMessenger](https://github.com/Graphene-Lab/GrapheneMessenger)
- Desktop app: [GrapheneMessenger-Desktop](https://github.com/Graphene-Lab/GrapheneMessenger-Desktop)

## Install

1. Go to the [Releases page](https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/releases).
2. Download the file for your system:
   - **Windows**: `GrapheneMessenger-Setup-x.x.x.exe`
   - **macOS**: `GrapheneMessenger-x.x.x.dmg`
   - **Linux**: `graphene-messenger-desktop_x.x.x_amd64.deb`
3. Open the file and follow the steps.

> The installers are not signed yet. Your computer may show a security warning the
> first time. This is normal. See [First launch](#first-launch).

## First launch

When you open GrapheneMessenger Desktop for the first time, you must link it to
your phone.

**On the computer:** a QR code appears on the screen.

**On the phone:**

1. Open the GrapheneMessenger app.
2. Go to **Settings → Linked devices**.
3. Tap **Link a device**.
4. Point the phone camera at the QR code on your computer.

The link is done. Your chat history is now on the computer too.

> If the QR code does not scan, check the light and the camera focus. You can also
> use the manual link code shown under the QR code.

## Send a message

1. Click the **New chat** button (top left).
2. Pick a contact, or type a phone number.
3. Type your message in the box at the bottom.
4. Press **Enter** to send.

You can also:

- Send photos, videos, and files with the **paperclip** icon.
- Send a voice message with the **microphone** icon.
- Add a reaction by long-pressing (or right-clicking) a message.

## Start a call

Open a chat and click the **call** icon (phone) for a voice call, or the **video**
icon for a video call.

- To mute the microphone, click the **mute** icon during the call.
- To turn the camera off, click the **camera** icon.
- To end the call, click the **end** icon.

## Groups

1. Click **New chat**.
2. Choose **New group**.
3. Add members and give the group a name.
4. Click **Create**.

Group admins can add or remove members and change the group settings.

## Settings

Click your **profile picture** (top left), then **Settings**. Here you can change:

- **Appearance**: light or dark theme, chat colors.
- **Notifications**: sound, message preview, and when you get them.
- **Chats**: message timer (messages delete after a set time).
- **Privacy**: who can call you, read receipts, and screen security.
- **Linked devices**: see and remove your other devices.
- **Advanced**: file storage, and app updates.

## Security and privacy

- **End-to-end encryption**: only you and the person you talk to can read the
  messages.
- **Safety number**: each contact has a safety number. You can check it in the
  contact details to confirm the connection is secure.
- **Screen security**: you can hide the app content in the taskbar switcher.
- **Disappearing messages**: set a timer so messages delete automatically.
- **Block and report**: you can block a contact or report spam.

## Update the app

The app checks for updates by itself. When a new version is ready, you see a
message. Click **Restart to update**.

You can also download the newest version from the
[Releases page](https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/releases).

## Troubleshooting

**The app does not open after install**
The installer is not signed. On Windows, choose "More info → Run anyway". On
macOS, right-click the app and choose "Open". On Linux, run the `.deb` with your
package manager.

**QR code does not link**
Make sure the phone and the computer have internet. Clean the camera lens. Try the
manual code under the QR image.

**No sound in calls**
Check your microphone and speaker in your system settings. Then check the device
in GrapheneMessenger **Settings → Calls**.

**Messages not syncing**
Make sure your phone is on and connected. Reopen the desktop app to sync.

## Get help

- Questions: open an [issue](https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/issues).
- Bugs: search the [existing issues](https://github.com/Graphene-Lab/GrapheneMessenger-Desktop/issues)
  first, then open a new one if it is new.
- Contributing: see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Cryptography Notice

This distribution includes cryptographic software. The country where you live may
have rules about importing, using, or re-exporting encryption software. Before you
use this software, check your country's laws. See <http://www.wassenaar.org/>.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS)
classified this software as Export Commodity Control Number (ECCN) 5D002.C.1. This
covers information security software that uses asymmetric cryptographic algorithms.
This distribution is eligible for export under the License Exception ENC Technology
Software Unrestricted (TSU) exception (see the BIS Export Administration
Regulations, Section 740.13) for both object code and source code.

## License

This software is licensed under the GNU AGPLv3:
https://www.gnu.org/licenses/agpl-3.0.html

Copyright notices are kept in the `LICENSE` file and in the source files, as the
AGPL requires.

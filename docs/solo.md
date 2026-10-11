# solo.zen

solo.zen is the Nexora version of the owner's Solo Live project. It reuses the existing Solo viewer and chat component and connects to https://solo-live-production.up.railway.app through a dedicated, allowlisted main-process bridge. It provides live room status, viewing, chat, mute, fullscreen and the existing peer connection flow. The source application's phone studio remains the broadcasting interface.

This is an audited built-in integration, separate from uploaded community HTML. Community sites still cannot execute JavaScript or make external requests. The Solo bridge accepts only the exact existing room/ICE endpoint paths and viewer/chat actions; it cannot fetch arbitrary URLs or perform host administration. Solo cookies use their own Electron session partition and never receive Nexora's account token. The browser address remains solo.zen, and sharing copies that name.

Live playback depends on the host broadcasting and on WebRTC connectivity. The source Solo service supports a small peer-to-peer room; its existing STUN/TURN behavior and network limitations apply. No new streaming provider or paid service is enabled by this integration. Camera capture is not enabled in Nexora. The original Solo interface and its original project remain independent; changes here do not overwrite them.

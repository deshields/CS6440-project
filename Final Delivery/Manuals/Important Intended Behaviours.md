## Intended Behaviours ##
Below are a list of intended behaviours that may seem strange and their reasoning for being there.

---
### My user isn't logged in when I refresh! ###
Intended because I didn't have a moment to implement Oauth authorization, and felt that it'd be safer to refuse to use cookies to keep a user logged in as we're dealing with medical information. Also makes it simpler to demo.

### Why doesn't the invite document pop up on create? Why not another button? ###
Because the `react-pdf` package does not support rendering documents in a function call, and hooks cause infinite state changes with it. 
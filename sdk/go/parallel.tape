# VHS tape: record `go run ./parallel` as an animated GIF.
# https://github.com/charmbracelet/vhs
#
# Generate it (from this sdk/go directory, with your Docker auth exported):
#   export DOCKER_USERNAME=... DOCKER_PAT=...
#   vhs parallel.tape            # -> parallel.gif
#
Output parallel.gif
Require go

Set Shell "bash"
Set FontSize 16
Set Width 1000
Set Height 640
Set Padding 24
Set Theme "Catppuccin Mocha"

Type "go run ./parallel"
Sleep 500ms
Enter
Sleep 24s
Sleep 1500ms

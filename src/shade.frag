#version 410
uniform float elapsed;
out vec4 frag_colour;
void main() {
    frag_colour = vec4(0,abs(sin(elapsed)), 0, 1);
}

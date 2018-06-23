package main

import (
	"log"
	"runtime"
	"io/ioutil"
	"strings"
	"fmt"
	"os"
	"github.com/go-gl/gl/v4.1-core/gl"
	"github.com/go-gl/glfw/v3.2/glfw"
	//"github.com/go-gl/mathgl/mgl32"
)

const (
	width = 1200
	height = 800
	vertPath = "./shade.vert"
	fragPath = "./shade.frag"
	max_fps = 60
)

var (
	quad = []float32 {
	        -1.0, 1.0, 0,
	        1.0, 1.0, 0,
	        -1.0, -1.0, 0,
	        1.0, -1.0, 0,
   }
)

func main() {
	runtime.LockOSThread()

	window := initGlfw()
	window.SetKeyCallback(keyCallback)
	defer glfw.Terminate()
	program := initOpenGL()
		
	vao := makeVao(quad)
	last_time := glfw.GetTime()
	var elapsed float32
	var wWidth int
	var wHeight int
	var scale float32
	for !window.ShouldClose() {
		wWidth, wHeight = window.GetSize()
		if glfw.GetTime() - last_time >= 1.0/max_fps {
			gl.Viewport(0,0, int32(wWidth), int32(wHeight))
			last_time = glfw.GetTime()
			elapsed = float32(glfw.GetTime())
			scale = float32(wWidth)/float32(wHeight)
			gl.Uniform1f(gl.GetUniformLocation(program, gl.Str("u_time\x00")), elapsed)
			gl.Uniform2f(gl.GetUniformLocation(program, gl.Str("u_resolution\x00")), float32(wWidth), float32(wHeight))
			gl.Uniform2f(gl.GetUniformLocation(program, gl.Str("u_scale\x00")), scale, 1.0)
			draw(vao, window, program, elapsed)
		}
	}
}

func initGlfw() *glfw.Window {
	check_err(glfw.Init())

	glfw.WindowHint(glfw.Resizable, glfw.True)
	glfw.WindowHint(glfw.ContextVersionMajor, 4)
	glfw.WindowHint(glfw.ContextVersionMinor, 1)
	glfw.WindowHint(glfw.OpenGLProfile, glfw.OpenGLCoreProfile)
	glfw.WindowHint(glfw.OpenGLForwardCompatible, glfw.True)

	window, err := glfw.CreateWindow(width, height, "Shader Thing", nil, nil)
	check_err(err)


	window.MakeContextCurrent()

	return window
}

func initOpenGL() uint32 {
	check_err(gl.Init())

	version := gl.GoStr(gl.GetString(gl.VERSION))
	log.Println("OpenGL version:", version)

	vertexShader, err := compileShader(loadShader(vertPath), gl.VERTEX_SHADER)
	check_err(err)

	fragmentShader, err := compileShader(loadShader(fragPath), gl.FRAGMENT_SHADER)
	check_err(err)

	program := gl.CreateProgram()

	gl.AttachShader(program, vertexShader)
	gl.AttachShader(program, fragmentShader)
	gl.LinkProgram(program)
	return program
}

func draw(vao uint32, window *glfw.Window, program uint32, elapsed float32) {
	gl.Clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.UseProgram(program)

	gl.BindVertexArray(vao)
	gl.DrawArrays(gl.TRIANGLE_STRIP, 0, int32(len(quad) / 3))
	glfw.PollEvents()
	window.SwapBuffers()
}

func loadShader(path string) string {
	data, err := ioutil.ReadFile(path)
	check_err(err)
	return string(data) + "\x00"
}

func compileShader(source string, shaderType uint32) (uint32, error) {
	shader := gl.CreateShader(shaderType)

	csources, free := gl.Strs(source)
	gl.ShaderSource(shader, 1, csources, nil)
	free()
	gl.CompileShader(shader)

	var status int32
	gl.GetShaderiv(shader, gl.COMPILE_STATUS, &status)
	if status == gl.FALSE {
		var logLength int32
		gl.GetShaderiv(shader, gl.INFO_LOG_LENGTH, &logLength)

		log := strings.Repeat("\x00", int(logLength+1))
		gl.GetShaderInfoLog(shader, logLength, nil, gl.Str(log))
		
		return 0, fmt.Errorf("failed to compile %v:%v", source, log)
	}

	return shader, nil
}

func makeVao(points []float32) uint32 {
	var vbo uint32
	gl.GenBuffers(1, &vbo)
	gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.BufferData(gl.ARRAY_BUFFER, len(points)*4, gl.Ptr(points), gl.STATIC_DRAW)

	var vao uint32
	gl.GenVertexArrays(1, &vao)
	gl.BindVertexArray(vao)
	gl.EnableVertexAttribArray(0)
	gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.VertexAttribPointer(0, 3, gl.FLOAT, false, 0, nil)

	return vao
}

func keyCallback(window *glfw.Window, key glfw.Key, scancode int, action glfw.Action, mods glfw.ModifierKey) {
	if key == glfw.KeyEscape && action == glfw.Press {
		os.Exit(0)
	}
}

func check_err(e error) {
	if e != nil {
		panic(e)
	}
}

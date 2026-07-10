Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile("C:\Users\shubham naik\Desktop\Atelier plastics\assets\images\logo.png")
$bitmap = New-Object System.Drawing.Bitmap $image.Width, $image.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.DrawImage($image, 0, 0, $image.Width, $image.Height)
$bitmap.Save("C:\Users\shubham naik\Desktop\Atelier plastics\assets\images\og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
$image.Dispose()

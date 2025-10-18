import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ success: false, error: "Wrong Password" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" } 
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({success: false, error: error.message})
  }
};

const verify = (req, res) =>{
    return res.status(200).json({success: true, user: req.user})
}

const updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, error: "Nombre y correo son obligatorios" });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "El correo ya esta en uso" });
    }

    const updatePayload = {
      name,
      email,
      updatedAt: new Date(),
    };

    if (typeof profileImage !== "undefined") {
      updatePayload.profileImage = profileImage;
    }

    await User.findByIdAndUpdate(req.user._id, updatePayload);
    const refreshedUser = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      success: true,
      user: {
        _id: refreshedUser._id,
        name: refreshedUser.name,
        email: refreshedUser.email,
        role: refreshedUser.role,
        profileImage: refreshedUser.profileImage ?? null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "No se pudo actualizar el perfil" });
  }
};

export { login, verify, updateProfile };

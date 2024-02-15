const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");
const filesService = require("./files.service");
const userResolver = require("../middlewares/user-resolver");

async function controller(req, res) {
    const {fileId} = req.params;
    const {user} = req.body;

    const removeShareLinkFromFile = await filesService.removeShareLinkFromFile(fileId, user.username);

    if (!removeShareLinkFromFile.modifiedCount) {
      res.json({
        success: false,
        data: `link not found in the fileId - ${fileId} to remove`
      })
      return;
    }

    res.json({
      message: "suceess",
      data: `link removed from the fileId - ${fileId}`
    })

}




const missingParamsValidator = paramsValidator.createParamValidator(
  ["fileId"],
  paramsValidator.REQ_COMPONENT.PARAMS
);

module.exports = buildApiHandler([userResolver("user"), missingParamsValidator, controller]);

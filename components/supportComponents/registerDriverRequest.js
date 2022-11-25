import { useSelector } from 'react-redux';


export default function registerDriverRequest() {

    const output = useSelector((store) => store.driver);

    const uploadImageToS3 = async image => {
        const options = {
            keyPrefix: "registerDriverImages/",
            bucket: "testbucketpiinfo",
            region: "ap-south-1",
            accessKey: S3_ACCESS_KEY,
            secretKey: S3_SECRET_KEY,
            successActionStatus: 201
        }

        const file = {
            uri: `${image.uri}`,
            name: image.uri.substring(image.uri.lastIndexOf('/') + 1), //extracting filename from image path
            type: "image/jpg",
        };

        try {
            const response = await RNS3.put(file, options)
            if (response.status === 201) {
                console.log("Success: ", response.body)

            } else {
                console.log("Failed to upload image to S3: ", response)
            }
            return response;
        } catch (error) {
            console.log(error)
        }
    };

    let jsonRequest = {
        driverId: output.driver.driverID,
        autoDetails: {
            autoImages: {
                front: output.driver.frontAuto,
                back: output.driver.backAuto
            },
            autoNumber: output.driver.autoNumber,
            deviceMac: output.driver.deviceID
        },
        bankingDetails: {
            bankAccountNumber: output.driver.bankAccountNumber,
            bankName: output.driver.bankName,
            bankPhoneNumber: output.driver.bankPhoneNumber,
            upiAddress: output.driver.upiAddress
        },
        identityParameters: {
            aadhaar: {
                front: output.driver.frontAadhaar,
                back: output.driver.backAadhaar,
            },
            activeStatus: "Pending",
            dateOfBirth: output.driver.dateOfBirth,
            dateOfOnboarding: output.driver.dateOfBirth,
            emailId: output.driver.emailId,
            firstName: output.driver.firstName,
            lastName: output.driver.lastName,
            image: {
                id: output.driver.image.id,
                uri: output.driver.image.uri
            },
            permanentAddress: output.driver.registerAddress.address,
            phoneNumber: output.driver.phoneNumber,
            registerAddress: output.driver.registerAddress
        }
    }



}
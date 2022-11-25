import React, { useState, useEffect } from 'react';

export default function registerDriverRequest() {

    let output = {
        driver: {
            autoNumber: "HR12AE8942",
            backAadhaar: {
                id: "9a8e992a-84b2-40b4-832a-9365e2d7d44e",
                uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FMeetrApp-3cccd3d5-02c2-413e-9981-1532a9f1392d/ImageManipulator/cc784aef-cd8c-4299-99fa-167a00349d07.jpg"
            },
            backAuto: {
                id: "7619ada6-a390-48f0-aa33-884a484318d1",
                uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FMeetrApp-3cccd3d5-02c2-413e-9981-1532a9f1392d/ImageManipulator/ffcc786e-4ee3-41de-855e-1df87cb51a87.jpg"
            },
            bankAccountNumber: "5284929738",
            bankName: "Kotak",
            bankPhoneNumber: "8447848609",
            dateOfBirth: "30-01-1997",
            driverID: "27a703bd-3716-4597-b4a1-4061b529eed0",
            emailId: "rickshesh.iitd@gmail.com",
            firstName: "Rickshesh ",
            frontAadhaar: {
                id: "ea912948-f3a6-4110-b2bc-3708a81df38d",
                uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FMeetrApp-3cccd3d5-02c2-413e-9981-1532a9f1392d/ImageManipulator/17b5fcdf-0c13-4ef2-82bc-1aa55a1d262d.jpg"
            },
            frontAuto: {
                id: "7bef0353-f997-47ed-8530-c9f3e834debf",
                uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FMeetrApp-3cccd3d5-02c2-413e-9981-1532a9f1392d/ImageManipulator/952f0499-0fa1-4fa0-8bcd-a4bb37b81b33.jpg"
            },
            image: {
                id: "7ad63e64-9eb1-44ff-932f-4666fd8e3970",
                uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FMeetrApp-3cccd3d5-02c2-413e-9981-1532a9f1392d/ImageManipulator/4917ba0f-06a6-43ab-9818-0a394423ffad.jpg"
            },
            lastName: "Manchanda",
            phoneNumber: "8447848609",
            registerAddress: {
                address: "139-L, Model Town, Haryana, 124001, Rohtak",
                lat: 28.8907243,
                lon: 76.6139194
            },
            upiAddress: "rickshesh.iitd@okicici"
        }
    }

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